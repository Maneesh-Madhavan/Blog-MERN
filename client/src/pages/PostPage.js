import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [loading, setLoading] = useState(true);
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
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading post...</p>
      </div>
    );

  if (!postInfo) return <div className="no-posts">Post not found</div>;

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
