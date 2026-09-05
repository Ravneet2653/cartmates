import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

// Handles links like /join?roomCode=X8Z8RL — auto-joins if logged in,
// or sends the person to log in/sign up first and comes back here after,
// so an invite link works even for someone brand new to the app.
export default function JoinRoom() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get("roomCode");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return; // don't decide anything until we know the real auth state

    if (!roomCode) {
      setError("This invite link is missing a room code.");
      return;
    }

    if (!user) {
      // Not logged in — remember this exact URL, come back after login/signup
      navigate("/login", { state: { from: location } });
      return;
    }

    api
      .post("/shared-cart/join", { roomCode: roomCode.toUpperCase() })
      .then(() => navigate(`/shared-cart/${roomCode.toUpperCase()}`))
      .catch((err) => setError(err.response?.data?.message || "Could not join this room"));
  }, [roomCode, user, loading]);

  if (error) return <p className="error-text">{error}</p>;
  return <p>Joining room...</p>;
}
