import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function SharedCartHome() {
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async () => {
    setError("");
    try {
      const res = await api.post("/shared-cart/create");
      navigate(`/shared-cart/${res.data.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not create shared cart");
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/shared-cart/join", { roomCode: joinCode.toUpperCase() });
      navigate(`/shared-cart/${res.data.roomCode}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not join — check the room code");
    }
  };

  return (
    <div>
      <h2>Shared Cart</h2>

      <div className="summary-card" style={{ padding: "20px", marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px" }}>Start a new room</h3>
        <p style={{ color: "var(--text-muted)", marginTop: 0, fontSize: "0.88rem" }}>
          You'll get a room code to share with your group.
        </p>
        <button className="btn btn-primary" onClick={handleCreate}>
          Create Shared Cart
        </button>
      </div>

      <div className="summary-card" style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 8px" }}>Join an existing room</h3>
        <form onSubmit={handleJoin} style={{ display: "flex", gap: 10 }}>
          <input
            className="field"
            style={{ marginBottom: 0, fontFamily: "var(--font-display)", letterSpacing: "0.05em" }}
            placeholder="ROOM CODE"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
          />
          <button className="btn" type="submit">Join</button>
        </form>
      </div>

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
