import { useContext, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { useToast } from "../Toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUserInfo } = useContext(UserContext);
  const { addToast } = useToast();

  async function login(ev) {
    ev.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    try {
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const userInfo = await response.json();
        setUserInfo(userInfo);
        addToast(`Welcome back, ${userInfo.username}!`, "success");
        setRedirect(true);
      } else {
        const data = await response.json();
        setError(data.error || "Wrong credentials");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (redirect) return <Navigate to="/" />;

  return (
    <div className="auth-container container">
      <form className="login" onSubmit={login}>
      <h1>Welcome Back</h1>
      <span className="subtitle">Sign in to your account</span>

      {error && <div className="form-error">{error}</div>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={ev => setUsername(ev.target.value)}
      />

      <div className="password-field">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={ev => setPassword(ev.target.value)}
        />
        <button type="button" className="eye-toggle" onClick={() => setShowPassword(p => !p)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button disabled={loading}>
        {loading ? "Signing in…" : "Sign In"}
      </button>

      <p>
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </form>
    </div>
  );
}
