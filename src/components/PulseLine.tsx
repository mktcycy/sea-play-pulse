// Signature motif: a heartbeat "pulse" line tied to the product name.
export function PulseLine({ className = "", color = "#26E0C0" }: { className?: string; color?: string }) {
  return (
    <svg
      viewBox="0 0 240 40"
      fill="none"
      className={className}
      aria-hidden
      preserveAspectRatio="none"
    >
      <path
        d="M0 20 H40 l8-14 12 28 10-22 7 12 H120 l6-10 10 20 8-16 6 8 H240"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="520"
        strokeDashoffset="520"
        className="animate-pulse-dash"
      />
    </svg>
  );
}
