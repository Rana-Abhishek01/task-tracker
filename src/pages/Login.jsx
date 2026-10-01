import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const data = response.data;

      const token = data.token;

      if (!token) {
        setError("Login failed. Token was not received.");
        return;
      }

      localStorage.setItem("taskTrackerToken", token);

      if (data.user) {
        localStorage.setItem(
          "taskTrackerUser",
          JSON.stringify(data.user)
        );
      }

      localStorage.setItem("isLoggedIn", "true");

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">✓</div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to your Task Tracker account
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div
              style={{
                position: "relative",
                width: "100%",
                display: "grid",
              }}
            >
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete="current-password"
                style={{
                  gridArea: "1 / 1",
                  width: "100%",
                  paddingRight: "52px",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                disabled={loading}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                style={{
                  gridArea: "1 / 1",
                  alignSelf: "center",
                  justifySelf: "end",
                  marginRight: "10px",
                  width: "32px",
                  height: "32px",
                  border: "none",
                  background: "transparent",
                  cursor: loading ? "not-allowed" : "pointer",
                  padding: 0,
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 0,
                  zIndex: 2,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c5 0 8.27 4.11 9 7-.27 1.08-.92 2.29-1.83 3.39" />
                    <path d="M6.61 6.61C4.62 7.83 3.35 9.68 3 12c.73 2.89 4 7 9 7 1.61 0 3.05-.4 4.29-1.08" />
                    <line x1="3" y1="3" x2="21" y2="21" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.12 8.34 7.2 5 12 5s8.88 3.34 9.94 6.65a1 1 0 0 1 0 .7C20.88 15.66 16.8 19 12 19s-8.88-3.34-9.94-6.65Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: "#4f46e5",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;