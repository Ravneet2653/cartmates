import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Wrap any page that requires login: <ProtectedRoute><Cart /></ProtectedRoute>
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // don't redirect before we know the auth state
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
