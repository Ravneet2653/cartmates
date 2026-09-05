import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp, resendOtp } = useAuth();

  // Email arrives via navigation state from Signup (or Login, if it redirected
  // here for an unverified account). If someone lands here directly with no
  // state (e.g. a refresh), there's no email to verify — send them back.
  const emailFromState = location.state?.email;
  const [email] = useState(emailFromState || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!emailFromState) navigate("/signup");
  }, [emailFromState, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      navigate("/products");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    try {
      await resendOtp(email);
      setInfo("A new code has been sent");
      setCooldown(30); // prevents spamming the resend endpoint / Resend's rate limit
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    }
  };

  if (!emailFromState) return null; // redirecting

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <form className="form-card" onSubmit={handleVerify}>
        <h2>Check your email</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 20, fontSize: "0.9rem" }}>
          We sent a 6-digit code to <strong>{email}</strong>.
        </p>
        <input
          className="field"
          style={{ textAlign: "center", fontFamily: "var(--font-display)", fontSize: "1.4rem", letterSpacing: "0.3em" }}
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          required
        />
        {error && <p className="error-text">{error}</p>}
        {info && <p style={{ color: "var(--buy)", fontSize: "0.9rem" }}>{info}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading || otp.length !== 6} style={{ width: "100%" }}>
          {loading ? "Verifying..." : "Verify"}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", marginTop: 10 }}
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
        <p style={{ marginTop: 16, fontSize: "0.85rem", textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
