/** Brand mark for OrbitSpan using the high-resolution logo.png. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 group select-none ${className ?? ""}`}>
      <div className="relative flex items-center justify-center h-9 w-9 rounded-lg overflow-hidden bg-space-deep/40 border border-border/30 transition-all duration-500 group-hover:border-primary/50 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(var(--primary),0.2)]">
        <img
          src="/logo.png"
          alt="OrbitSpan Logo"
          className="h-7 w-7 object-contain transition-all duration-500 group-hover:rotate-[360deg]"
        />
      </div>
      <span className="text-lg md:text-xl font-bold tracking-tight text-foreground transition-all duration-300">
        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-primary transition-all duration-500">
          Orbit
        </span>
        <span className="text-primary relative inline-block transition-transform duration-500 group-hover:translate-x-0.5 font-extrabold">
          Span
        </span>
      </span>
    </div>
  );
}
