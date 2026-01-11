import { formatISO9075 } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({ _id, title, summary, cover, createdAt, author }) {
  return (
    <div className="post">
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={cover || "/placeholder.png"} alt={title} />
        </Link>
      </div>
      <div className="texts">
        <Link to={`/post/${_id}`}>
          <h2>{title}</h2>
        </Link>
        <p className="info">
          <span className="author">{author?.username || "Unknown"}</span>
          <time>{createdAt ? formatISO9075(new Date(createdAt)) : "Unknown date"}</time>
        </p>
        <p className="summary">{summary}</p>
      </div>
    </div>
  );
}
