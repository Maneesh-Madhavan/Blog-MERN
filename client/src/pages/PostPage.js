import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import { useToast } from "../Toast";
import { MdArrowBack, MdFavoriteBorder, MdFavorite, MdShare, MdEdit } from "react-icons/md";

function readingTime(content) {
  if (!content) return "1 min read";
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();
  const { addToast } = useToast();
  const [likes, setLikes] = useState([]);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    fetch(`${baseUrl}/post/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data?._id) {
          setPostInfo(data);
          setLikes(data.likes || []);
        } else {
          setPostInfo(null);
        }
      })
      .catch(() => setPostInfo(null));
  }, [id]);

  const isLiked = userInfo?.id && likes.includes(userInfo.id);

  async function toggleLike() {
    if (!userInfo) {
      addToast("Please sign in to like posts", "info");
      return;
    }
    if (liking) return;
    setLiking(true);
    try {
      const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/post/${id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
      }
    } catch {}
    setLiking(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    addToast("Link copied to clipboard!", "success");
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: postInfo.title,
          url: window.location.href
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="post-page container">
      {!postInfo ? (
        <PostPageSkeleton />
      ) : (
        <div className="fade-in">
          <Link to="/" className="back-link">
            <MdArrowBack size={18} /> Back to posts
          </Link>

          <h1>{postInfo.title}</h1>

          <div className="post-meta">
            <div className="author-badge">
              <div className="avatar-sm">
                {postInfo.author?.username?.[0]?.toUpperCase() || "U"}
              </div>
              {postInfo.author?.username || "Unknown"}
            </div>
            <span className="dot"></span>
            <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
            <span className="dot"></span>
            <span>{readingTime(postInfo.content)}</span>
          </div>

          <div className="post-actions">
            <button className={`action-btn ${isLiked ? "liked" : ""}`} onClick={toggleLike}>
              {isLiked ? <MdFavorite size={18} /> : <MdFavoriteBorder size={18} />}
              {likes.length > 0 ? likes.length : "Like"}
            </button>
            <button className="action-btn" onClick={handleShare}>
              <MdShare size={18} /> Share
            </button>
            {userInfo?.id === postInfo.author?._id && (
              <Link className="action-btn edit-btn" to={`/edit/${postInfo._id}`}>
                <MdEdit size={18} /> Edit
              </Link>
            )}
          </div>

          {postInfo.cover && (
            <div className="image">
              <img src={postInfo.cover} alt={postInfo.title} loading="lazy" />
            </div>
          )}

          <div className="content" dangerouslySetInnerHTML={{ __html: postInfo.content }} />
        </div>
      )}
    </div>
  );
}

function PostPageSkeleton() {
  return (
    <>
      <div className="skeleton-postpage title"></div>
      <div className="skeleton-postpage meta"></div>
      <div className="skeleton-postpage image"></div>
      <div className="skeleton-postpage text"></div>
      <div className="skeleton-postpage text short"></div>
    </>
  );
}
