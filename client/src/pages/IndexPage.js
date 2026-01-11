import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}post`)
      .then(res => res.json())
      .then(posts => {
        setPosts(posts);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <div className="loading">Loading posts...</div>;

  return (
    <main>
      {posts.length > 0 ? (
        posts.map(post => <Post key={post._id} {...post} />)
      ) : (
        <div className="no-posts">No posts found</div>
      )}
    </main>
  );
}
