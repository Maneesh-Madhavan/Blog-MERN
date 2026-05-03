import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MdEdit, MdVisibility, MdDelete, MdArticle } from "react-icons/md";
import { useToast } from "../Toast";

export default function MyPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    fetch(`${baseUrl}/myposts`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { setPosts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setPosts([]); setLoading(false); });
  }, []);

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/post/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p._id !== deleteId));
        addToast("Post deleted", "info");
      } else {
        addToast("Failed to delete post", "error");
      }
    } catch {
      addToast("Network error", "error");
    }
    setDeleteId(null);
  }

  return (
    <div className="myposts-page container fade-in">
      <h2>My Stories</h2>

      {loading ? (
        <SkeletonRows />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="icon" style={{ opacity: 0.3 }}><MdArticle size={48} /></div>
          <p>You haven't written any posts yet.</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post._id} className="mypost-card">
            <Link to={`/post/${post._id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
              <h3>{post.title}</h3>
            </Link>
            <div className="actions">
              <Link to={`/edit/${post._id}`} className="nav-btn" title="Edit">
                <MdEdit size={18} />
              </Link>
              <Link to={`/post/${post._id}`} className="nav-btn" title="View">
                <MdVisibility size={18} />
              </Link>
              <button className="nav-btn danger" onClick={() => setDeleteId(post._id)} title="Delete">
                <MdDelete size={18} />
              </button>
            </div>
          </div>
        ))
      )}

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Post?</h3>
            <p>This action cannot be undone. The post will be permanently removed.</p>
            <div className="modal-actions">
              <button onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="mypost-card skeleton" style={{ opacity: 0.5 }}>
          <div style={{ width: "60%", height: 18, background: "var(--skeleton-base)", borderRadius: 4 }} />
          <div className="actions">
            <div style={{ width: 36, height: 36, background: "var(--skeleton-base)", borderRadius: "50%" }} />
            <div style={{ width: 36, height: 36, background: "var(--skeleton-base)", borderRadius: "50%" }} />
          </div>
        </div>
      ))}
    </>
  );
}
