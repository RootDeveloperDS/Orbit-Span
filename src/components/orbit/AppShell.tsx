import { Link } from "@tanstack/react-router";
import { Gauge, Menu, WifiOff } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { useOrbitStore } from "@/store/useOrbitStore";

import { BrandMark } from "./BrandMark";

const NAV = [
  { to: "/", label: "Explorer" },
  { to: "/gravity-lab", label: "Gravity Lab" },
  { to: "/human-scale", label: "Human Scale" },
  { to: "/learn", label: "Science" },
  { to: "/sources", label: "Sources" },
] as const;

function OfflineBadge() {
  const { online, serviceWorker } = useOfflineStatus();
  if (online) {
    return (
      <span className="hidden items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase sm:flex">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${serviceWorker === "ready" ? "bg-primary" : "bg-muted-foreground"}`}
        />
        {serviceWorker === "ready"
          ? "Cached for offline"
          : serviceWorker === "unsupported"
            ? "Offline cache unavailable"
            : serviceWorker === "failed"
              ? "Cache failed"
              : "Caching…"}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] uppercase">
      <WifiOff className="h-3 w-3" aria-hidden="true" /> Offline
    </span>
  );
}

function PerformanceToggle() {
  const performanceMode = useOrbitStore((s) => s.performanceMode);
  const setPerformanceMode = useOrbitStore((s) => s.setPerformanceMode);
  return (
    <label className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase">
      <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden sm:inline">Reduced effects</span>
      <Switch
        checked={performanceMode}
        onCheckedChange={setPerformanceMode}
        aria-label="Reduced effects mode"
      />
    </label>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-space-deep/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-4 px-4">
          <Link to="/" className="text-foreground">
            <BrandMark />
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground bg-secondary/60" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <OfflineBadge />
            <PerformanceToggle />
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border/70 px-4 py-2 md:hidden" aria-label="Mobile">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-2 py-2 text-sm text-muted-foreground"
                    activeProps={{ className: "text-foreground bg-secondary/60" }}
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/70 px-4 py-4">
        <p className="mx-auto max-w-[1600px] text-[11px] leading-relaxed text-muted-foreground">
          OrbitScale is an educational tool. Every planet attracts you gravitationally, but there is
          no established scientific evidence that planetary positions determine personality, luck,
          relationships, destiny or future events.
        </p>
      </footer>
    </div>
  );
}
