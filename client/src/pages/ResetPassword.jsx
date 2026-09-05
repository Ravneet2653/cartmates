import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailFromState) navigate("/forgot-password");
  }, [emailFromState, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: emailFromState, otp, newPassword });
      setSuccess("Password reset — redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!emailFromState) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Enter reset code</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 20, fontSize: "0.9rem" }}>
          Check <strong>{emailFromState}</strong> for the code.
        </p>
        <input
          className="field"
          style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "1.3rem", letterSpacing: "0.3em" }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        {success && <p style={{ color: "var(--buy)", fontSize: "0.9rem" }}>{success}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading || otp.length !== 6} style={{ width: "100%" }}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <p style={{ marginTop: 16, fontSize: "0.85rem", textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
