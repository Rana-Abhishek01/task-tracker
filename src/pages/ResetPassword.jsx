import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing password reset link.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });

      setMessage(
        response.data.message ||
          "Password reset successfully. You can now login."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again."
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
            🔑
          </div>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "28px",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Reset Password
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            Create a new password for your Task Tracker account.
          </p>
        </div>

        {!token ? (
          <div
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: "14px",
              lineHeight: "1.5",
              textAlign: "center",
            }}
          >
            Invalid or missing password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="newPassword"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                New Password
              </label>

              <div
                style={{
                  position: "relative",
                  display: "grid",
                }}
              >
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={loading}
                  autoComplete="new-password"
                  style={{
                    gridArea: "1 / 1",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 48px 13px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    outline: "none",
                    fontSize: "14px",
                    color: "#111827",
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
                    marginRight: "8px",
                    width: "32px",
                    height: "32px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Confirm New Password
              </label>

              <div
                style={{
                  position: "relative",
                  display: "grid",
                }}
              >
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  disabled={loading}
                  autoComplete="new-password"
                  style={{
                    gridArea: "1 / 1",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "13px 48px 13px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "12px",
                    outline: "none",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  style={{
                    gridArea: "1 / 1",
                    alignSelf: "center",
                    justifySelf: "end",
                    marginRight: "8px",
                    width: "32px",
                    height: "32px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    padding: 0,
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "14px",
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
                  marginBottom: "14px",
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
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
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

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