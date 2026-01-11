import {Link, useLocation} from "react-router-dom";
import {useContext, useEffect} from "react";
import {UserContext} from "./UserContext";
import { MdAddCircleOutline, MdLogout, MdArticle, MdLogin, MdPersonAdd } from "react-icons/md";

export default function Header() {
  const {setUserInfo, userInfo} = useContext(UserContext);
  const location = useLocation();

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}profile`, {
      credentials: 'include',
    }).then(res => res.json())
      .then(user => setUserInfo(user));
  }, []);

  function logout() {
    fetch(`${process.env.REACT_APP_API_URL}logout`, {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <header>
      <Link to="/" className="logo">InsightBlog</Link>
      <nav>
        {!isAuthPage && userInfo ? (
          <>
            <Link to="/create" title="Create Post" className="icon-link">
              <MdAddCircleOutline size={24} />
            </Link>
            <Link to="/myposts" title="My Posts" className="icon-link">
              <MdArticle size={24} />
            </Link>
            <button onClick={logout} title="Logout" className="icon-link">
              <MdLogout size={24} />
            </button>
          </>
        ) : !userInfo && (
          <>
            <Link to="/login" title="Login" className="icon-link">
              <MdLogin size={24} />
            </Link>
            <Link to="/register" title="Register" className="icon-link">
              <MdPersonAdd size={24} />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
