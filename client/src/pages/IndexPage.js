import Post from "../Post";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PenIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:"0 auto 16px",display:"block",opacity:.35}}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{margin:"0 auto 16px",display:"block",opacity:.35}}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    setLoading(true);
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    const url = searchQuery
      ? `${baseUrl}/post/search?q=${encodeURIComponent(searchQuery)}`
      : `${baseUrl}/post`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, [searchQuery]);

  return (
    <div className="index-container">
      {/* Hero section removed as requested */}      {searchQuery && (
        <div className="search-results-header">
          <h2>Results for &ldquo;{searchQuery}&rdquo;</h2>
          <p>{posts.length} stories found</p>
        </div>
      )}

      <div className="container">
        <div className="posts-grid">
          {loading ? (
            <SkeletonPosts />
          ) : posts.length > 0 ? (
            posts.map(post => <Post key={post._id} {...post} />)
          ) : (
            <div className="empty-state">
              {searchQuery ? <SearchIcon /> : <PenIcon />}
              <p>{searchQuery ? "No posts match your search." : "No posts yet. Be the first to write!"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonPosts() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="post skeleton">
          <div className="image" />
          <div className="texts">
            <div className="line title" />
            <div className="line small" />
            <div className="line" />
            <div className="line small" />
          </div>
        </div>
      ))}
    </>
  );
}
