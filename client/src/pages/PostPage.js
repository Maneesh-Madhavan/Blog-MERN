import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(true); // spinner state
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}post/${id}`)
      .then(res => res.json())
      .then(post => {
        setPostInfo(post);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #ccc",
            borderTop: "4px solid #555",
            borderRadius: "50%",
            margin: "auto",
            animation: "spin 0.8s linear infinite",
          }}
        ></div>
        <p>Loading post...</p>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );

  if (!postInfo) return <div style={{ textAlign: "center", marginTop: 50 }}>Post not found</div>;

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author?.username || "Unknown"}</div>

      {userInfo && userInfo.id === postInfo.author?._id && (
        <div className="edit-row">
          <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
            Edit this post
          </Link>
        </div>
      )}

      <div className="image">
        <img src={postInfo.cover || "/placeholder.png"} alt={postInfo.title} />
      </div>

      <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />
    </div>
  );
}
