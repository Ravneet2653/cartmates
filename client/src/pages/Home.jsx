import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const steps = [
  {
    title: "Create a room",
    text: "Start a shared cart and get a unique room code in seconds.",
  },
  {
    title: "Invite your people",
    text: "Share the code. Friends or family join and see the same cart live.",
  },
  {
    title: "Decide together",
    text: "Chat, react, vote, and get an AI Buy/Skip/Maybe — all in real time.",
  },
];

const features = [
  {
    title: "Real-time sync",
    text: "Every change — items, votes, messages — appears instantly for everyone in the room.",
  },
  {
    title: "AI recommendations",
    text: "Gemini analyzes the product and your group's conversation to suggest Buy, Skip, or Maybe.",
  },
  {
    title: "Group chat & reactions",
    text: "Talk it through with emoji reactions and live messaging, right next to the product.",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "60px 20px 50px" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(1.9rem, 6vw, 2.6rem)",
            lineHeight: 1.2,
            margin: "0 0 16px",
            color: "var(--text)",
          }}
        >
          Shop together.<br />
          <span style={{ fontFamily: "var(--font-script)", fontWeight: 400, color: "var(--accent)", fontSize: "1.15em" }}>
            Decide together.
          </span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 32px" }}>
          Create a shared cart, invite your people, and get an AI opinion —
          all live, all in one room.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          {user ? (
            <Link to="/shared-cart" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "0.85rem" }}>
              Start a Shared Cart
            </Link>
          ) : (
            <Link to="/signup" className="btn btn-primary" style={{ padding: "12px 28px", fontSize: "0.85rem" }}>
              Get Started
            </Link>
          )}
          <Link to="/products" className="btn" style={{ padding: "12px 28px", fontSize: "0.85rem" }}>
            Browse Products
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "40px 0" }}>
        <h3 style={{ textAlign: "center", marginBottom: 28 }}>How it works</h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              style={{
                flex: "1 1 240px",
                maxWidth: 280,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "24px 20px",
              }}
            >
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--gold))",
                  color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: "0.9rem", marginBottom: 14,
                  boxShadow: "0 4px 12px rgba(255,45,138,0.3)",
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{step.title}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>{step.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "40px 0 60px" }}>
        <h3 style={{ textAlign: "center", marginBottom: 28 }}>What makes it different</h3>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                flex: "1 1 240px",
                maxWidth: 280,
                textAlign: "center",
                padding: "0 12px",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6, color: "var(--accent)" }}>{f.title}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.6 }}>{f.text}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
