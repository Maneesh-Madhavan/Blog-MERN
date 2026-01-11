import {Link} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext";
import { MdAddCircleOutline, MdLogout } from "react-icons/md"; // Material icons

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}profile`, {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch(`${process.env.REACT_APP_API_URL}logout`, {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
  <header>
      <Link to="/" className="logo">InsightBlog</Link>
      <nav>
        {userInfo ? (
          <>
            <Link to="/create" title="Create new post" className="icon-link">
              <MdAddCircleOutline size={24} />
            </Link>
            <button onClick={logout} title="Logout" className="icon-link">
              <MdLogout size={24} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
