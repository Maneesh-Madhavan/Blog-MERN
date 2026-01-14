import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch(`${process.env.REACT_APP_API_URL}register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      alert("Registration successful");
    } else {
      alert("Registration failed");
    }
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>

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
        <span
          className="eye-icon"
          onClick={() => setShowPassword(prev => !prev)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <button>Register</button>
    </form>
  );
}
