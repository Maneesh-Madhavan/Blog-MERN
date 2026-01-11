const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const fs = require("fs");

const User = require("./models/User");
const Post = require("./models/Post");

require("dotenv").config();

const app = express();
const uploadMiddleware = multer({ dest: "uploads/" });
const salt = bcrypt.genSaltSync(10);
const secret = "ssajhfuiqfhoqhuw67196";

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(4000, () => console.log("Server running on 4000"));
  });

// AUTH
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch {
    res.status(400).json("Error");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  if (!userDoc) return res.status(400).json("User not found");

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) return res.status(400).json("Wrong credentials");

  jwt.sign({ id: userDoc._id }, secret, {}, (err, token) => {
    res.cookie("token", token).json({ id: userDoc._id, username });
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

// CREATE POST
app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const ext = originalname.split(".").pop();
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);

  const { token } = req.cookies;
  jwt.verify(token, secret, async (err, info) => {
    if (err) return res.status(401).json("Unauthorized");

    const { title, summary, content } = req.body;

    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    });

    res.json(postDoc);
  });
});

// GET POSTS
app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 });
  res.json(posts);
});

// GET SINGLE POST
app.get("/post/:id", async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", ["username"]);
  res.json(post);
});

// UPDATE POST
app.put("/post/:id", uploadMiddleware.single("file"), async (req, res) => {
  let newFile = null;

  if (req.file) {
    const ext = req.file.originalname.split(".").pop();
    newFile = req.file.path + "." + ext;
    fs.renameSync(req.file.path, newFile);
  }

  const { token } = req.cookies;
  jwt.verify(token, secret, async (err, info) => {
    if (err) return res.status(401).json("Unauthorized");

    const postDoc = await Post.findById(req.params.id);
    if (!postDoc) return res.status(404).json("Not found");

    if (postDoc.author.toString() !== info.id) {
      return res.status(403).json("Forbidden");
    }

    postDoc.title = req.body.title;
    postDoc.summary = req.body.summary;
    postDoc.content = req.body.content;
    if (newFile) postDoc.cover = newFile;

    await postDoc.save();
    res.json(postDoc);
  });
});
