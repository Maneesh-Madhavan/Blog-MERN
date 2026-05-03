import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { useTheme } from "./ThemeContext";
import { useToast } from "./Toast";
import {
  MdAddCircleOutline, MdLogout,
  MdArticle, MdSearch, MdClose, MdDarkMode, MdLightMode, MdMenu
} from "react-icons/md";

export default function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const hideAuth = location.pathname === "/login" || location.pathname === "/register";

  function logout() {
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    fetch(`${baseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUserInfo(null);
    addToast("Logged out", "info");
    navigate("/");
  }

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
      setMobileOpen(false);
    }
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="header-left">
          <Link to="/" className="logo">Insight<span>.</span></Link>
        </div>

        <div className="header-right">
          <nav className={`main-nav ${mobileOpen ? "mobile-open" : ""}`}>
            <form onSubmit={handleSearch} className={`search-container ${searchOpen ? "is-active" : ""}`}>
              <input
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus={searchOpen}
              />
              <button type="button" className="icon-btn" onClick={() => setSearchOpen(p => !p)}>
                {searchOpen ? <MdClose /> : <MdSearch />}
              </button>
            </form>

            <button type="button" className="icon-btn theme-toggle" onClick={toggleTheme}>
              {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
            </button>

            {userInfo && !hideAuth ? (
              <>
                <Link to="/create" className="nav-link" title="Write">
                  <MdAddCircleOutline /> <span>Write</span>
                </Link>
                <Link to="/myposts" className="nav-link" title="My Posts">
                  <MdArticle /> <span>Stories</span>
                </Link>
                <div className="user-profile">
                  <div className="user-avatar">{userInfo.username?.[0]?.toUpperCase()}</div>
                </div>
                <button type="button" onClick={logout} className="icon-btn logout-btn" title="Logout">
                  <MdLogout />
                </button>
              </>
            ) : !hideAuth && (
              <>
                <Link to="/login" className="nav-link login-link">Sign In</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
          </nav>

          <button className="mobile-toggle" onClick={() => setMobileOpen(p => !p)}>
            {mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </div>
      </div>
      {mobileOpen && <div className="mobile-backdrop" onClick={() => setMobileOpen(false)}></div>}
    </header>
  );
}
