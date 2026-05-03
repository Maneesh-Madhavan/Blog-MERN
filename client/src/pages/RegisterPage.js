import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useToast } from "../Toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function getStrength(pw) {
  if (!pw) return "";
  if (pw.length < 4) return "weak";
  if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return "medium";
  return "strong";
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { addToast } = useToast();

  const strength = getStrength(password);

  async function register(ev) {
    ev.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const baseUrl = process.env.REACT_APP_API_URL.replace(/\/$/, "");
    try {
      const response = await fetch(`${baseUrl}/register`, {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        addToast("Account created! Please sign in.", "success");
        setRedirect(true);
      } else {
        const data = await response.json();
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  if (redirect) return <Navigate to="/login" />;

  return (
    <div className="auth-container container">
      <form className="register" onSubmit={register}>
      <h1>Create Account</h1>
      <span className="subtitle">Join the community of writers</span>

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

      {password && (
        <div className="password-strength">
          <div className={`bar strength-${strength}`} />
        </div>
      )}

      <div className="password-field">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={ev => setConfirmPassword(ev.target.value)}
        />
        <button type="button" className="eye-toggle" onClick={() => setShowConfirmPassword(p => !p)}>
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button disabled={loading}>
        {loading ? "Creating…" : "Create Account"}
      </button>

      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
    </div>
  );
}
