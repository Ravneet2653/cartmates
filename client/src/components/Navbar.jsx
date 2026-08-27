import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const initials = (name) => name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <span className="brand">Cart<span>Mates</span></span>
      <Link to="/products">Products</Link>
      {user && <Link to="/cart">My Bag</Link>}
      {user && <Link to="/shared-cart">Shared Cart</Link>}
      <span className="spacer">
        {user ? (
          <>
            <span className="user-chip">
              <span className="avatar">{initials(user.name)}</span> {user.name}
            </span>
            <button className="btn btn-small btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </span>
    </nav>
  );
}
