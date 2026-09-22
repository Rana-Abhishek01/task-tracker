import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const enteredEmail = email.trim().toLowerCase();
    const enteredPassword = password;

    if (!enteredEmail || !enteredPassword) {
      alert("Please enter email and password");
      return;
    }

    // Get saved user
    const savedUser = JSON.parse(localStorage.getItem("taskTrackerUser"));

    if (!savedUser) {
      alert("No account found. Please create an account first.");
      return;
    }

    const savedEmail = String(savedUser.email || "")
      .trim()
      .toLowerCase();

    const savedPassword = String(savedUser.password || "");

    if (
      savedEmail === enteredEmail &&
      savedPassword === enteredPassword
    ) {
      // Login successful
      localStorage.setItem("isLoggedIn", "true");

      alert("Login successful!");

      navigate("/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>

        <p className="subtitle">
          Login to your Task Tracker account
        </p>

        <form onSubmit={handleLogin}>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{" "}
          <a href="/register">Create Account</a>
        </p>
      </div>
    </div>
  );
}

export default Login;