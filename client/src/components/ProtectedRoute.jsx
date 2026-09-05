import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Wrap any page that requires login: <ProtectedRoute><Cart /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>Loading...</p>; // don't redirect before we know the auth state
  // Remember the intended destination — Login uses this to send the person
  // back to wherever they were actually headed (e.g. an invite link).
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}
