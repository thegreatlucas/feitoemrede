export function Arrow() {
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 19 19 5M5 5h14v14" />
    </svg>
  );
}
export function Burst() {
  return (
    <svg
      className="burst-icon"
      viewBox="0 0 100 100"
      aria-hidden="true"
      fill="currentColor"
    >
      {[0, 45, 90, 135].map((angle) => (
        <rect
          key={angle}
          x="44"
          y="3"
          width="12"
          height="94"
          transform={`rotate(${angle} 50 50)`}
        />
      ))}
    </svg>
  );
}
