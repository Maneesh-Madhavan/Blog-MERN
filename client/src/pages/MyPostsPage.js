import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdEdit, MdPageview, MdDelete } from "react-icons/md";

export default function MyPostsPage() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}myposts`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => setPosts([]));
  }, []);

  async function deletePost(postId) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}post/${postId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (response.ok) {
      setPosts(prev => prev.filter(p => p._id !== postId));
    } else {
      alert("Failed to delete post");
    }
  }

  
  if (posts === null) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;
  }

  if (posts.length === 0) {
    return <p style={{ textAlign: "center", marginTop: 50 }}>You have no posts yet.</p>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "10px" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>My Posts</h2>

      {posts.map(post => (
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
            background: "#fff"
          }}
        >
          <Link
            to={`/post/${post._id}`}
            style={{
              textDecoration: "none",
              color: "#111",
              flex: 1
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
      ))}
    </div>
  );
}
