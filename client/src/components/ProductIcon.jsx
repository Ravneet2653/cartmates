// bare=true renders just the SVG (used inside .image-area / .thumb wrappers
// that already provide their own background box). Without it, wraps itself
// in a small standalone box for places with no surrounding container.
export default function ProductIcon({ bare = false }) {
  const svg = (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );

  if (bare) return svg;

  return (
    <div style={{ width: 40, height: 40, borderRadius: 6, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {svg}
    </div>
  );
}
