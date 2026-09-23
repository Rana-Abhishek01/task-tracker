import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Client-side validation
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
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

      // Register with backend API
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(
        response.data?.message || "Registration successful!"
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      // Go to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      const message =
        err.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>✓</div>

          <h1 style={styles.title}>Create Account</h1>

          <p style={styles.subtitle}>
            Create your Task Tracker account
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleRegister}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              autoComplete="name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>

          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    background:
      "linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #eff6ff 100%)",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    padding: "38px",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.12)",
    boxSizing: "border-box",
  },

  header: {
    textAlign: "center",
    marginBottom: "28px",
  },

  logo: {
    width: "54px",
    height: "54px",
    margin: "0 auto 16px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
  },

  title: {
    margin: "0 0 8px",
    color: "#111827",
    fontSize: "28px",
    fontWeight: "700",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
  },

  error: {
    marginBottom: "20px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    fontSize: "14px",
  },

  success: {
    marginBottom: "20px",
    padding: "12px 14px",
    borderRadius: "10px",
    background: "#f0fdf4",
    color: "#16a34a",
    border: "1px solid #bbf7d0",
    fontSize: "14px",
  },

  field: {
    marginBottom: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    outline: "none",
    fontSize: "15px",
    color: "#111827",
    background: "#ffffff",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    transition: "0.2s",
  },

  footer: {
    marginTop: "24px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
  },

  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;