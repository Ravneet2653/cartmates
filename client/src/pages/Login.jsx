import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where ProtectedRoute (or JoinRoom) sent the person FROM, if anywhere —
  // e.g. someone clicked an invite link, wasn't logged in, and needs to
  // land back on that exact link after logging in.
  const redirectTo = () => {
    const from = location.state?.from;
    return from ? `${from.pathname}${from.search}` : "/products";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo());
    } catch (err) {
      // Login itself returns 403 + needsVerification for an unverified
      // account — send them straight to the verify page instead of leaving
      // them stuck on an error with no way forward. Carry "from" along too,
      // so verifying still ends up back at the original destination.
      if (err.response?.data?.needsVerification) {
        navigate("/verify-otp", { state: { email: err.response.data.email, from: location.state?.from } });
        return;
      }
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Welcome back</h2>
        <p style={{ color: "var(--ink-soft)", marginTop: 0, marginBottom: 20 }}>
          Log in to your carts.
        </p>
        <input
          className="field"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="field"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div style={{ textAlign: "right", marginTop: -6, marginBottom: 14 }}>
          <Link to="/forgot-password" style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Forgot password?
          </Link>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        <p style={{ marginTop: 16, fontSize: "0.9rem" }}>
          No account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
