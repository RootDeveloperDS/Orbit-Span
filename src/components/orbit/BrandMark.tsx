/** Temporary text/icon brand mark for OrbitScale. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <ellipse
          cx="16"
          cy="16"
          rx="14"
          ry="6"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.2"
          transform="rotate(-24 16 16)"
        />
        <circle cx="16" cy="16" r="4.5" fill="currentColor" />
        <circle cx="27" cy="10" r="1.8" fill="currentColor" fillOpacity="0.8" />
      </svg>
      <span className="text-base font-semibold tracking-tight">
        Orbit<span className="text-primary">Scale</span>
      </span>
    </span>
  );
}
