import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}post`)
      .then(res => res.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <main>
      {posts.length > 0 ? (
        posts.map(post => <Post key={post._id} {...post} />)
      ) : (
        <SkeletonPosts />
      )}
    </main>
  );
}

/* 🔹 Simple skeleton */
function SkeletonPosts() {
  return (
    <>
      {[1,2,3].map(i => (
        <div key={i} className="post skeleton">
          <div className="image" />
          <div className="texts">
            <div className="line title" />
            <div className="line small" />
            <div className="line" />
          </div>
        </div>
      ))}
    </>
  );
}
