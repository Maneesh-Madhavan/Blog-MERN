import { useContext, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const { userInfo } = useContext(UserContext);
  const { id } = useParams();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}post/${id}`)
      .then(res => res.json())
      .then(data => setPostInfo(data?._id ? data : null))
      .catch(() => setPostInfo(null));
  }, [id]);

  return (
    <div className="post-page">
      {!postInfo ? (
        <PostPageSkeleton />
      ) : (
        <>
          <h1>{postInfo.title}</h1>

          <time>{formatISO9075(new Date(postInfo.createdAt))}</time>

          <div className="author">
            by @{postInfo.author?.username || "Unknown"}
          </div>

          {userInfo?.id === postInfo.author?._id && (
            <div className="edit-row">
              <Link className="edit-btn" to={`/edit/${postInfo._id}`}>
                Edit this post
              </Link>
            </div>
          )}

          <div className="image">
            <img
              src={postInfo.cover || "/placeholder.png"}
              alt={postInfo.title}
              loading="lazy"
            />
          </div>

          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: postInfo.content }}
          />
        </>
      )}
    </div>
  );
}

/* -------- Skeleton -------- */
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
