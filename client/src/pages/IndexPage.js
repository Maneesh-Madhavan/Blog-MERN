import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // spinner while fetching

  useEffect(() => {
    fetch("http://localhost:4000/post")
      .then(res => res.json())
      .then(posts => {
        setPosts(posts);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: "center", marginTop: 50 }}>Loading posts...</div>;

  return (
    <>
      {posts.length > 0 ? (
        posts.map(post => <Post key={post._id} {...post} />)
      ) : (
        <div style={{ textAlign: "center", marginTop: 50 }}>No posts found</div>
      )}
    </>
  );
}
