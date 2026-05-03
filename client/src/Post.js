import { Link } from "react-router-dom";
import { MdFavorite, MdAccessTime } from "react-icons/md";

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function readingTime(content) {
  if (!content) return "1 min read";
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function Post({ _id, title, summary, cover, content, createdAt, author, likes }) {
  return (
    <div className="post fade-in">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={cover || "/placeholder.png"} alt={title} loading="lazy" />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <span className="author">{author?.username || "Unknown"}</span>
          <span className="dot"></span>
          <time>{createdAt ? timeAgo(createdAt) : "Unknown date"}</time>
        </p>
        <p className="summary">{summary}</p>
        
        <div className="post-footer-meta">
          <span className="meta-pill">
            <MdAccessTime size={16} /> {readingTime(content)}
          </span>
          {likes && likes.length > 0 && (
            <span className="meta-pill" style={{ color: 'var(--danger)' }}>
              <MdFavorite size={16} /> {likes.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
