import { Link, useLocation } from "@tanstack/react-router";
import {
  Gauge,
  Menu,
  WifiOff,
  Mail,
  Github,
  Linkedin,
  Twitter,
  Send,
  Globe,
  Briefcase,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

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
  const location = useLocation();
  const isExplorer = location.pathname === "/";

  // Automatically synchronize simulation time to the latest current time whenever user opens the app
  useEffect(() => {
    useOrbitStore.getState().now();
  }, []);

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

      <footer
        className={`border-t border-border/70 bg-[#050814]/95 backdrop-blur-xl transition-all duration-300 ${
          isExplorer ? "lg:hidden" : ""
        }`}
      >
        {/* Glow accent line */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />

        <div className="mx-auto max-w-[1600px] px-6 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-12">
            {/* Column 1: Brand & Bio */}
            <div className="space-y-4 md:col-span-4">
              <Link to="/" className="inline-block text-foreground">
                <BrandMark />
              </Link>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                OrbitSpan is an interactive astrophysics & orbital scale explorer. High-precision calculations, real-time planetary positions, human-scale benchmarks, and true gravitational pull.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://github.com/RootDeveloperDS/Orbit-Span"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <Github className="h-3.5 w-3.5" />
                  <span>100% Open Source · Contribute</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                </a>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-secondary/40 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
                  v1.1.0
                </span>
              </div>
            </div>

            {/* Column 2: App Navigation Links */}
            <div className="space-y-3 md:col-span-2">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Navigation
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    to="/"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    3D Explorer
                  </Link>
                </li>
                <li>
                  <Link
                    to="/gravity-lab"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Gravity Lab
                  </Link>
                </li>
                <li>
                  <Link
                    to="/human-scale"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Human Scale
                  </Link>
                </li>
                <li>
                  <Link
                    to="/learn"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Science & Formulas
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sources"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    Data & Ephemerides
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Creator & Professional Links */}
            <div className="space-y-3 md:col-span-3">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Created By
              </h3>
              <div className="space-y-2.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Devansh Sharma</p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://devanshsharma.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <span>Portfolio</span>
                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <a
                    href="https://rootdeveloperds.odoo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <span>RootDeveloperDS</span>
                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                  <a
                    href="mailto:developersofroot@gmail.com"
                    className="group inline-flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                    <span>developersofroot@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 4: Social & Community Presence */}
            <div className="space-y-3 md:col-span-3">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground">
                Connect & Community
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://github.com/RootDeveloperDS"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className="group flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 p-2 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary/60 hover:text-foreground"
                >
                  <Github className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span className="truncate font-medium">GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/devanshsharma987"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className="group flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 p-2 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary/60 hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4 shrink-0 text-[#0A66C2] transition-transform duration-300 group-hover:scale-110" />
                  <span className="truncate font-medium">LinkedIn</span>
                </a>
                <a
                  href="https://x.com/devanshsha6563"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter) Profile"
                  className="group flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 p-2 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary/60 hover:text-foreground"
                >
                  <Twitter className="h-4 w-4 shrink-0 text-sky-400 transition-transform duration-300 group-hover:scale-110" />
                  <span className="truncate font-medium">Twitter / X</span>
                </a>
                <a
                  href="https://t.me/developerofroot"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram Channel"
                  className="group flex items-center gap-2.5 rounded-lg border border-border/40 bg-secondary/20 p-2 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary/60 hover:text-foreground"
                >
                  <Send className="h-4 w-4 shrink-0 text-[#229ED9] transition-transform duration-300 group-hover:scale-110" />
                  <span className="truncate font-medium">Telegram</span>
                </a>
              </div>

              {/* Direct Action Contact Button */}
              <div className="pt-2">
                <a
                  href="mailto:developersofroot@gmail.com?subject=OrbitSpan%20Feedback%20%26%20Inquiry"
                  className="flex items-center justify-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-sm"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Contact Developer</span>
                </a>
              </div>
            </div>
          </div>

          {/* Open Source Callout & Community Notice */}
          <div className="mt-8 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-muted-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Github className="h-4 w-4 text-primary" /> Open Source & Contributions Welcome
              </p>
              <p className="mt-0.5 text-[11px]">
                OrbitSpan is fully open source. Feature ideas, astronomical fixes, and UI improvements are welcome from everyone!
              </p>
            </div>
            <a
              href="https://github.com/RootDeveloperDS/Orbit-Span"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm"
            >
              <span>Contribute on GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Scientific Disclaimer Note */}
          <div className="mt-4 rounded-lg border border-border/40 bg-secondary/15 p-3.5 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground uppercase tracking-wider block mb-1">
              Scientific Notice
            </span>
            OrbitSpan is an educational platform. Every celestial body exerts real gravitational acceleration on your mass, but there is no scientific basis linking planetary coordinates to astrology, personality, relationships, or destiny.
          </div>

          {/* Bottom Bar: Copyright & PWA Offline Status */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row">
            <p className="text-[11px]">
              &copy; {new Date().getFullYear()} OrbitSpan. Crafted with precision by{" "}
              <a
                href="https://devanshsharma.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Devansh Sharma
              </a>
              . All rights reserved.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/RootDeveloperDS/Orbit-Span"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
              >
                <Github className="h-3 w-3" /> Orbit-Span
              </a>
              <span>·</span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Offline PWA Ready
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
