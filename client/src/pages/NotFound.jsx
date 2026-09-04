import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <h2 style={{ fontSize: "2rem" }}>404</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
        This page doesn't exist.
      </p>
      <Link to="/products" className="btn btn-primary">
        Back to Products
      </Link>
    </div>
  );
}
