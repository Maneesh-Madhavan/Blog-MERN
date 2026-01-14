import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdEdit, MdPageview, MdDelete } from "react-icons/md";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}myposts`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]));
  }, []);

  async function deletePost(id) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const res = await fetch(
      `${process.env.REACT_APP_API_URL}post/${id}`,
      { method: "DELETE", credentials: "include" }
    );

    if (res.ok) {
      setPosts(prev => prev.filter(p => p._id !== id));
    } else {
      alert("Failed to delete post");
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 10 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>My Posts</h2>

      {posts.length === 0 ? (
        <SkeletonRows />
      ) : (
        posts.map(post => (
          <div
            key={post._id}
            style={{
              marginBottom: 15,
              border: "1px solid #ddd",
              borderRadius: 5,
              padding: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
            }}
          >
            <Link
              to={`/post/${post._id}`}
              style={{
                textDecoration: "none",
                color: "#111",
                flex: 1,
              }}
            >
              <h3 style={{ margin: 0 }}>{post.title}</h3>
            </Link>

            <div style={{ display: "flex", gap: 10 }}>
              <Link to={`/edit/${post._id}`} title="Edit" className="icon-link">
                <MdEdit size={22} />
              </Link>

              <Link to={`/post/${post._id}`} title="View" className="icon-link">
                <MdPageview size={22} />
              </Link>

              <button
                onClick={() => deletePost(post._id)}
                title="Delete"
                className="icon-link"
              >
                <MdDelete size={22} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* 🔹 Skeleton rows */
function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            marginBottom: 15,
            border: "1px solid #eee",
            borderRadius: 5,
            padding: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f5f5f5",
            animation: "pulse 1.2s infinite",
          }}
        >
          <div style={{ width: "60%", height: 18, background: "#ddd" }} />
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 22, height: 22, background: "#ddd" }} />
            <div style={{ width: 22, height: 22, background: "#ddd" }} />
            <div style={{ width: 22, height: 22, background: "#ddd" }} />
          </div>
        </div>
      ))}
    </>
  );
}
