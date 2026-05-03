const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

const User = require("./models/User");
const Post = require("./models/Post");

require("dotenv").config();

const app = express();
const uploadMiddleware = multer({ storage: multer.memoryStorage() });
const salt = bcrypt.genSaltSync(10);
const secret = process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

/* ---------------- CLOUDINARY ---------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://insightblog-mernblog.vercel.app",
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* ---------------- DB (SAFE FOR VERCEL) ---------------- */
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection failed:", err.message);
  }
}

connectDB().catch(err => console.error("DB error:", err));

/* ---------------- HELPERS ---------------- */
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "blog" },
      (err, result) => err ? reject(err) : resolve(result)
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

function authMiddleware(req, res, next) {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, secret, (err, info) => {
    if (err) return res.status(401).json({ error: "Unauthorized" });
    req.user = info;
    next();
  });
}

/* ================= AUTH ================= */

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if username already exists
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json({ error: "Registration failed. Please try again." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const userDoc = await User.findOne({ username });
  if (!userDoc) return res.status(400).json({ error: "User not found" });

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) return res.status(400).json({ error: "Wrong credentials" });

  jwt.sign({ id: userDoc._id, username: userDoc.username }, secret, {}, (err, token) => {
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
    }).json({ id: userDoc._id, username });
  });
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ error: "No token" });

  jwt.verify(token, secret, (err, info) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  }).json("ok");
});

/* ================= POSTS ================= */

app.post("/post", authMiddleware, uploadMiddleware.single("file"), async (req, res) => {
  let imageUrl = "";
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer);
    imageUrl = uploaded.secure_url;
  }

  const { title, summary, content } = req.body;

  const postDoc = await Post.create({
    title,
    summary,
    content,
    cover: imageUrl,
    author: req.user.id,
    likes: [],
  });

  res.json(postDoc);
});

app.get("/post", async (req, res) => {
  await connectDB();
  try {
    const posts = await Post.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/post/search", async (req, res) => {
  await connectDB();
  const { q } = req.query;
  if (!q) return res.json([]);
  try {
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
      ],
    })
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/post/:id", async (req, res) => {
  await connectDB();
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", ["username"]);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/myposts", authMiddleware, async (req, res) => {
  const posts = await Post.find({ author: req.user.id })
    .sort({ createdAt: -1 });
  res.json(posts);
});

app.put("/post/:id", authMiddleware, uploadMiddleware.single("file"), async (req, res) => {
  const postDoc = await Post.findById(req.params.id);
  if (!postDoc) return res.status(404).json({ error: "Not found" });

  if (postDoc.author.toString() !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer);
    postDoc.cover = uploaded.secure_url;
  }

  postDoc.title = req.body.title;
  postDoc.summary = req.body.summary;
  postDoc.content = req.body.content;

  await postDoc.save();
  res.json(postDoc);
});

app.delete("/post/:id", authMiddleware, async (req, res) => {
  const postDoc = await Post.findById(req.params.id);
  if (!postDoc) return res.status(404).json({ error: "Not found" });

  if (postDoc.author.toString() !== req.user.id)
    return res.status(403).json({ error: "Forbidden" });

  await Post.findByIdAndDelete(req.params.id);
  res.json("Deleted");
});

/* ================= LIKES ================= */

app.post("/post/:id/like", authMiddleware, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const userId = req.user.id;
  const index = post.likes.indexOf(userId);

  if (index === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(index, 1);
  }

  await post.save();
  res.json({ likes: post.likes });
});

/* ================= SEED DATABASE ================= */
app.post("/seed", async (req, res) => {
  try {
    const seedPosts = [
      {
        title: "The Future of Web Development: WebAssembly and Beyond",
        summary: "Explore how WebAssembly is changing the landscape of web development, allowing high-performance applications to run seamlessly in the browser.",
        content: "<h2>Introduction</h2><p>WebAssembly (Wasm) is a binary instruction format for a stack-based virtual machine. Wasm is designed as a portable compilation target for programming languages, enabling deployment on the web for client and server applications.</p><h2>Why it Matters</h2><p>Unlike JavaScript, which is parsed, compiled, and optimized on the fly, WebAssembly is pre-compiled. This means it executes much faster, opening doors for intensive tasks like video editing, 3D gaming, and complex simulations running directly in your browser without lag.</p><h2>The Future</h2><p>As more languages like Rust, C++, and Go offer first-class support for compiling to WebAssembly, the web is transitioning into a truly universal operating system.</p>",
        cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        title: "Mastering React Server Components in 2026",
        summary: "React Server Components have revolutionized the way we build full-stack applications. Learn the best practices for leveraging RSCs for maximum performance.",
        content: "<h2>A Paradigm Shift</h2><p>React Server Components allow developers to build applications that span the server and client, combining the rich interactivity of client-side apps with the improved performance of traditional server rendering.</p><h2>Zero Bundle Size</h2><p>One of the most significant advantages is that Server Components have zero impact on the bundle size. Since they execute exclusively on the server, their dependencies aren't sent to the client.</p><h2>Data Fetching</h2><p>Fetching data within RSCs is straightforward and secure, allowing direct access to backend resources like databases and file systems without exposing sensitive APIs.</p>",
        cover: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        title: "Building Scalable Microservices with Node.js",
        summary: "A comprehensive guide to designing and deploying scalable microservices architectures using Node.js, Docker, and Kubernetes.",
        content: "<h2>The Architecture</h2><p>Microservices architecture structures an application as a collection of loosely coupled services. This approach enhances scalability and accelerates deployment cycles.</p><h2>Node.js at the Core</h2><p>Node.js is an excellent choice for building microservices due to its event-driven, non-blocking I/O model. It excels at handling asynchronous tasks and concurrent connections.</p><h2>Containerization</h2><p>Dockerizing your Node.js microservices ensures consistency across different environments, making orchestration with Kubernetes seamless and robust.</p>",
        cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        title: "The Silent Epidemic: Understanding Burnout and How to Prevent It",
        summary: "In our hyper-connected world, burnout is more common than ever. Discover the science behind chronic stress and practical strategies for mental recovery.",
        content: "<h2>Recognizing the Signs</h2><p>Burnout is not just feeling tired; it's a state of emotional, physical, and mental exhaustion caused by excessive and prolonged stress. It occurs when you feel overwhelmed, emotionally drained, and unable to meet constant demands.</p><h2>The Physiological Impact</h2><p>Chronic stress keeps your cortisol levels artificially high, disrupting sleep patterns, compromising the immune system, and increasing the risk of cardiovascular diseases.</p><h2>Prevention Strategies</h2><p>Setting strict boundaries, practicing mindfulness, and ensuring adequate rest are critical. Remember, disconnecting is not a luxury; it is a necessity for long-term health.</p>",
        cover: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
      },
      {
        title: "Nutritional Psychiatry: How Food Impacts Your Mood",
        summary: "An emerging field of research reveals the profound connection between gut health, the microbiome, and mental well-being.",
        content: "<h2>The Gut-Brain Axis</h2><p>The gut-brain axis is a bidirectional communication network that links the enteric and central nervous systems. This network is not just anatomical, but extends to include endocrine, humoral, metabolic, and immune routes of communication.</p><h2>Serotonin and the Microbiome</h2><p>Remarkably, about 95% of your serotonin is produced in your gastrointestinal tract. This means your digestive system doesn't just help you digest food; it also guides your emotions.</p><h2>Foods for Thought</h2><p>Diets rich in prebiotics, probiotics, and omega-3 fatty acids have been shown to significantly improve symptoms of depression and anxiety.</p>",
        cover: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&auto=format&fit=crop&w=2053&q=80"
      },
      {
        title: "The Science of Sleep: Why 8 Hours is Non-Negotiable",
        summary: "We explore the critical restorative processes that occur during deep sleep and why cutting corners on rest severely impacts cognitive performance.",
        content: "<h2>The Sleep Cycles</h2><p>Sleep is not a uniform state but a complex series of cycles consisting of REM (Rapid Eye Movement) and non-REM sleep. Each stage plays a specific role in brain health and physical restoration.</p><h2>Memory Consolidation</h2><p>During deep, slow-wave sleep, the brain consolidates memories, transferring them from the short-term memory vault (hippocampus) to long-term storage in the neocortex.</p><h2>Cellular Repair</h2><p>Sleep is when the body conducts major maintenance work. Growth hormones are released, tissue is repaired, and the brain's glymphatic system flushes out neurotoxins accumulated during waking hours.</p>",
        cover: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?ixlib=rb-4.0.3&auto=format&fit=crop&w=2060&q=80"
      }
    ];

    let user = await User.findOne({ username: "insightAdmin" });
    if (!user) {
      user = await User.create({
        username: "insightAdmin",
        password: bcrypt.hashSync("password123", salt)
      });
    }

    await Post.deleteMany({});

    const postsToInsert = seedPosts.map(post => ({
      ...post,
      author: user._id,
      likes: []
    }));

    await Post.insertMany(postsToInsert);
    res.json({ success: true, message: `Seeded ${postsToInsert.length} posts.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- LOCAL ONLY ---------------- */
if (process.env.NODE_ENV !== "production") {
  app.listen(4000, () => console.log("Server running on 4000"));
}

/* ---------------- EXPORT FOR VERCEL ---------------- */
module.exports = app;
