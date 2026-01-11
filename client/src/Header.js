import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import {
  MdAddCircleOutline,
  MdLogout,
  MdLogin,
  MdPersonAdd,
  MdArticle
} from "react-icons/md";

export default function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const location = useLocation();

  const hideAuthIcons =
    location.pathname === "/login" ||
    location.pathname === "/register";

  function logout() {
    fetch(`${process.env.REACT_APP_API_URL}logout`, {
      method: "POST",
      credentials: "include",
    });
    setUserInfo(null);
  }

  return (
    <header>
      <Link to="/" className="logo">InsightBlog</Link>
      <nav>
        {userInfo && !hideAuthIcons && (
          <>
            <Link to="/create" className="icon-link" title="Create">
              <MdAddCircleOutline size={24} />
            </Link>
            <Link to="/myposts" className="icon-link" title="My Posts">
              <MdArticle size={24} />
            </Link>
            <button onClick={logout} className="icon-link" title="Logout">
              <MdLogout size={24} />
            </button>
          </>
        )}

        {!userInfo && (
          <>
            <Link to="/login" className="icon-link" title="Login">
              <MdLogin size={24} />
            </Link>
            <Link to="/register" className="icon-link" title="Register">
              <MdPersonAdd size={24} />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
