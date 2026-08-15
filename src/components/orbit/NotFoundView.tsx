import { Link, useRouter } from "@tanstack/react-router";
import {
  Compass,
  ArrowLeft,
  Home,
  Orbit,
  Scale,
  Sparkles,
  RefreshCw,
  Search,
  Radio,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const SPACE_FACTS = [
  "If Earth were the size of a 10 cm fist, the Sun would be a 11-metre sphere 1.17 km away, and Neptune would sit 35 km away in the next town.",
  "Because gravitational acceleration falls off with the square of distance, a person standing 1 metre away from you exerts more pull on your body than Mars does.",
  "Voyager 1 is over 160 Astronomical Units (24 billion km) away, traveling at ~17 km/s—yet it is still in the Sun's gravitational domain.",
  "Jupiter's mass is 318 times Earth's, but its immense distance means its gravitational acceleration on you on Earth is less than 0.0000003 m/s².",
  "Space is mostly empty: over 99.86% of the Solar System's total mass is concentrated inside the Sun alone.",
  "Tidal forces fall off with the cube of distance (1/r³), which is why the Moon's ocean tidal effect on Earth is more than twice as strong as the Sun's.",
];

const NAVIGATION_HUBS = [
  {
    to: "/",
    title: "3D Solar System Explorer",
    desc: "Real planetary positions & live orbital simulation",
    icon: Orbit,
    badge: "Primary Hub",
    color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
  },
  {
    to: "/gravity-lab",
    title: "Gravity Lab",
    desc: "Calculate Newtonian planetary pull on your body mass",
    icon: Compass,
    badge: "Interactive Lab",
    color: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
  },
  {
    to: "/human-scale",
    title: "Human Scale Model",
    desc: "Shrink Earth to a fist or marble for intuitive scale",
    icon: Scale,
    badge: "Scale Benchmarks",
    color: "from-sky-500/20 to-teal-500/10 border-sky-500/30 text-sky-400",
  },
  {
    to: "/learn",
    title: "Science & Physics",
    desc: "Inverse-square law, tides & physics vs astrology",
    icon: Sparkles,
    badge: "Astrophysics Guide",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
  },
];

export function NotFoundView() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [factIndex, setFactIndex] = useState(0);
  const [factFading, setFactFading] = useState(false);
  const [timeUtc, setTimeUtc] = useState("");

  // Live UTC telemetry timestamp
  useEffect(() => {
    const updateTime = () => {
      setTimeUtc(new Date().toISOString().replace("T", " ").replace("Z", " UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Starfield gravitation canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle pool
    const numStars = Math.min(120, Math.floor((width * height) / 12000));
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.4,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35,
      opacity: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint deep space nebula radial gradients
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.6,
      );
      grad.addColorStop(0, "rgba(20, 35, 75, 0.25)");
      grad.addColorStop(0.5, "rgba(10, 18, 40, 0.15)");
      grad.addColorStop(1, "rgba(5, 8, 20, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Render stars with gentle gravitational drift toward center/mouse
      for (const star of stars) {
        star.pulse += 0.02;
        const currentOpacity = star.opacity + Math.sin(star.pulse) * 0.2;

        // Subtle pull toward mouse
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 30 && dist < 400) {
          star.x += (dx / dist) * 0.25;
          star.y += (dy / dist) * 0.25;
        } else {
          star.x += star.speedX;
          star.y += star.speedY;
        }

        // Screen wrap
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 255, ${Math.max(0.1, Math.min(1, currentOpacity))})`;
        ctx.shadowBlur = star.size > 1.2 ? 6 : 0;
        ctx.shadowColor = "rgba(100, 200, 255, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleNextFact = () => {
    setFactFading(true);
    setTimeout(() => {
      setFactIndex((prev) => (prev + 1) % SPACE_FACTS.length);
      setFactFading(false);
    }, 200);
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-space-deep flex flex-col items-center justify-center px-4 py-12 text-foreground">
      {/* Background Interactive Starfield */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl space-y-8 text-center">
        {/* Top Telemetry Status Chip */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-destructive/40 bg-destructive/10 px-4 py-1.5 backdrop-blur-md">
          <Radio className="h-3.5 w-3.5 animate-pulse text-destructive" />
          <span className="font-mono text-[11px] tracking-[0.14em] text-destructive uppercase">
            Deep Space Signal Lost · Error 404
          </span>
          <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
            · {timeUtc || "LIVE TELEMETRY"}
          </span>
        </div>

        {/* Central Visual Anomaly & Number */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Orbital Pulsar Ring Animation */}
          <div className="relative flex h-36 w-36 items-center justify-center sm:h-44 sm:w-44">
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_18s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-dashed border-cyan-400/30 animate-[spin_24s_linear_infinite_reverse]" />
            <div className="absolute inset-6 rounded-full border border-purple-500/20 animate-pulse" />
            <div className="absolute inset-10 rounded-full bg-gradient-to-tr from-primary/30 via-cyan-500/10 to-transparent blur-md" />

            {/* Glowing Core */}
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-primary/60 bg-space-deep/90 shadow-[0_0_35px_rgba(72,176,255,0.4)]">
              <Orbit className="h-10 w-10 animate-spin text-primary duration-10000" />
            </div>
          </div>

          <h1 className="mt-4 text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground/40 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl text-foreground">
            Celestial Coordinates Not Found
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The orbital vector you entered points to unmapped deep space beyond the Kuiper Belt. No
            ephemeris series or gravitational body was detected at this location.
          </p>
        </div>

        {/* Live Telemetry Readout Grid */}
        <div className="mx-auto max-w-2xl rounded-xl border border-border/70 bg-card/60 p-4 backdrop-blur-xl shadow-lg">
          <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-4 font-mono text-[11px]">
            <div className="rounded-lg border border-border/40 bg-secondary/30 p-2.5">
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">
                Sector
              </span>
              <span className="text-destructive font-semibold">VOID_UNKNOWN</span>
            </div>
            <div className="rounded-lg border border-border/40 bg-secondary/30 p-2.5">
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">
                Distance (AU)
              </span>
              <span className="text-primary font-semibold">∞ AU</span>
            </div>
            <div className="rounded-lg border border-border/40 bg-secondary/30 p-2.5">
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">
                Gravity Pull
              </span>
              <span className="text-foreground font-semibold">0.000000 m/s²</span>
            </div>
            <div className="rounded-lg border border-border/40 bg-secondary/30 p-2.5">
              <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">
                Signal Status
              </span>
              <span className="text-amber-400 font-semibold">PULSAR ECHO</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            <span>Return to 3D Solar System</span>
          </Link>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.history.back();
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-md transition-all hover:bg-secondary hover:border-primary/40"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Orbit</span>
          </button>
        </div>

        {/* Fast Orbital Jump Hubs */}
        <div className="pt-4 text-left">
          <div className="mb-3 flex items-center justify-between px-1">
            <h3 className="font-mono text-xs tracking-wider uppercase text-muted-foreground flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Calibrated Trajectories (Safe Destinations)</span>
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground">Select a module</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {NAVIGATION_HUBS.map((hub) => {
              const Icon = hub.icon;
              return (
                <Link
                  key={hub.to}
                  to={hub.to}
                  className={`group relative flex items-start gap-3.5 rounded-xl border bg-gradient-to-br p-4 backdrop-blur-md transition-all hover:scale-[1.01] hover:border-primary/60 hover:shadow-md ${hub.color}`}
                >
                  <div className="rounded-lg border border-border/60 bg-secondary/50 p-2.5 text-foreground transition-transform duration-300 group-hover:scale-110 group-hover:text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {hub.title}
                      </h4>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground border border-border/40 rounded px-1.5 py-0.5">
                        {hub.badge}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {hub.desc}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Space Trivia / Did You Know Interactive Box */}
        <div className="mx-auto max-w-2xl rounded-xl border border-primary/20 bg-primary/5 p-4 text-left backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-xs text-foreground">
                Astrophysics Log · Did You Know?
              </span>
            </div>
            <button
              onClick={handleNextFact}
              aria-label="Next astronomy fact"
              className="inline-flex items-center gap-1 rounded border border-border/40 bg-secondary/40 px-2 py-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Next Fact
            </button>
          </div>
          <p
            className={`mt-2.5 text-xs leading-relaxed text-muted-foreground transition-opacity duration-200 ${
              factFading ? "opacity-0" : "opacity-100"
            }`}
          >
            "{SPACE_FACTS[factIndex]}"
          </p>
        </div>
      </div>
    </div>
  );
}
