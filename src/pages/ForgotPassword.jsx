import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setResetUrl("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(
        response.data.message ||
          "If an account exists with this email, a reset link has been generated."
      );

      if (response.data.resetUrl) {
        setResetUrl(response.data.resetUrl);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #f5f7ff 0%, #eef2ff 50%, #f8fafc 100%)",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              fontSize: "26px",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Forgot Password?
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            Enter your registered email address and we'll generate a password
            reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Email Address
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            disabled={loading}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "13px 14px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              outline: "none",
              fontSize: "14px",
              color: "#111827",
              background: loading ? "#f9fafb" : "#ffffff",
            }}
          />

          {error && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#fef2f2",
                color: "#b91c1c",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginTop: "14px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#ecfdf5",
                color: "#047857",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {message}
            </div>
          )}

          {resetUrl && (
            <div
              style={{
                marginTop: "14px",
                padding: "14px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#475569",
                }}
              >
                Development Reset Link
              </p>

              <a
                href={resetUrl}
                style={{
                  display: "block",
                  color: "#4f46e5",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  wordBreak: "break-all",
                  textDecoration: "none",
                }}
              >
                {resetUrl}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "13px 16px",
              border: "none",
              borderRadius: "12px",
              background: loading ? "#9ca3af" : "#4f46e5",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Generating Link..." : "Generate Reset Link"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
          }}
        >
          <Link
            to="/login"
            style={{
              color: "#4f46e5",
              fontSize: "14px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}