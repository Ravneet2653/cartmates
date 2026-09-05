import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Reset your password</h2>
        <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: 20, fontSize: "0.9rem" }}>
          Enter your email and we'll send you a reset code.
        </p>
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
        <p style={{ marginTop: 16, fontSize: "0.85rem", textAlign: "center" }}>
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
