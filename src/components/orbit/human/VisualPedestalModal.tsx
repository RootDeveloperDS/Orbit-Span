import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BODIES, BODY_ORDER, type BodyId } from "@/lib/orbit/constants";
import {
  REFERENCE_OPTIONS,
  formatModelLength,
  scaleFactor,
} from "@/lib/orbit/scale";
import {
  getClosestEverydayObject,
} from "@/lib/orbit/humanScaleData";
import { useOrbitStore } from "@/store/useOrbitStore";
import { Sparkles, Ruler, Footprints, Eye, Scale, User } from "lucide-react";

interface VisualPedestalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCityWalk?: () => void;
}

export function VisualPedestalModal({
  open,
  onOpenChange,
  onOpenCityWalk,
}: VisualPedestalModalProps) {
  const globalSelected = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);
  const earthReference = useOrbitStore((s) => s.earthReference);
  const setEarthReference = useOrbitStore((s) => s.setEarthReference);
  const customEarthM = useOrbitStore((s) => s.customEarthDiameterM);

  // Local active body state guarantees instant, synchronized updates
  const [activeId, setActiveId] = useState<BodyId>("earth");
  const [viewPerspective, setViewPerspective] = useState<"pair" | "human">("pair");
  const [activeTab, setActiveTab] = useState<"stage" | "all-planets">("stage");

  // Synchronize with global selection when modal opens
  useEffect(() => {
    if (open) {
      const validId = (globalSelected in BODIES ? globalSelected : "earth") as BodyId;
      setActiveId(validId);
    }
  }, [open, globalSelected]);

  const bodyMeta = BODIES[activeId] ?? BODIES.earth;

  // Resolve reference diameter
  const refM =
    earthReference === "custom"
      ? Math.max(customEarthM, 0.001)
      : REFERENCE_OPTIONS.find((o) => o.id === earthReference)?.metres ?? 0.1;
  const k = scaleFactor(refM);

  // True scaled physical dimensions in metres
  const activeDiameterM = bodyMeta.diameterM * k;
  const earthDiameterM = BODIES.earth.diameterM * k;
  const humanHeightM = 1.8;

  const activeObj = getClosestEverydayObject(activeDiameterM);
  const earthObj = getClosestEverydayObject(earthDiameterM);

  // Exact mathematical ratio relative to Earth
  const earthRatio = bodyMeta.diameterM / BODIES.earth.diameterM;
  const diameterCm = activeDiameterM * 100;
  const earthDiameterCm = earthDiameterM * 100;

  const handleSelectBody = (id: BodyId) => {
    setActiveId(id);
    selectBody(id);
  };

  // Intuitive sensory descriptions for each body
  const getSensoryIntuition = (id: BodyId) => {
    switch (id) {
      case "moon":
        return `The Moon is ${formatModelLength(
          activeDiameterM,
        )} wide (exactly ${(earthRatio * 100).toFixed(1)}% of Earth). It feels like holding a smooth pebble or walnut in your fingers. At this scale, it sits about ${(
          384_400_000 * k
        ).toFixed(2)} metres away across your living room!`;
      case "mercury":
        return `Mercury is ${formatModelLength(
          activeDiameterM,
        )} (${(earthRatio * 100).toFixed(1)}% of Earth) — like holding a regulation golf ball or ping pong ball. It's noticeably smaller than Earth, scorched by the Sun just 450 m away.`;
      case "venus":
        return `Venus is ${formatModelLength(
          activeDiameterM,
        )} (${(earthRatio * 100).toFixed(1)}% of Earth) — virtually an identical twin to Earth! In your hand, it feels like holding a large apple or orange.`;
      case "earth":
        return `Our home planet is calibrated here to ${formatModelLength(
          earthDiameterM,
        )} — exactly like holding a fresh grapefruit or clenched adult fist in your palm. Every ocean, continent, and person exists on this ball!`;
      case "mars":
        return `Mars measures ${formatModelLength(
          activeDiameterM,
        )} (${(earthRatio * 100).toFixed(1)}% of Earth) — like holding a small plum or kiwi fruit. You can easily close your fingers around it.`;
      case "jupiter":
        return `The King of Planets spans ${formatModelLength(
          activeDiameterM,
        )} across (${earthRatio.toFixed(1)}× Earth). That is a giant 1.1-metre fitness yoga ball that comes up to your chest! You would need more than 1,300 Earth grapefruits to fill its interior.`;
      case "saturn":
        return `Saturn's ball is ${formatModelLength(
          activeDiameterM,
        )} wide, but its stunning main ring system spans over ${formatModelLength(
          activeDiameterM * 2.3,
        )} across — wider than a king-size bed!`;
      case "uranus":
        return `Uranus is an icy sphere ${formatModelLength(
          activeDiameterM,
        )} across — like a beach ball or basketball that you would hold with both arms outstretched.`;
      case "neptune":
        return `Neptune is ${formatModelLength(
          activeDiameterM,
        )} across — a brilliant azure soccer ball or basketball sitting out in the cold outer solar system.`;
      case "sun":
        return `At this scale, the Sun is a gigantic ${formatModelLength(
          activeDiameterM,
        )} sphere — larger than a two-story suburban house! Even from 1.17 km away at Earth's position, it would shine brightly and illuminate the entire neighborhood.`;
      default:
        return `Model diameter: ${formatModelLength(activeDiameterM)}. Matches a ${activeObj.name.toLowerCase()}.`;
    }
  };

  /* =========================================================================
     MATHEMATICALLY RIGOROUS PROPORTIONS ENGINE (SHARED PIXELS PER METRE)
     ========================================================================= */

  // PERSPECTIVE 1: Direct Pair (Planet vs Earth)
  // Both Earth and the Selected Planet share the exact same scale factor S_pair:
  const maxPairM = Math.max(earthDiameterM, activeDiameterM);
  // Reserve 160px max height on the canvas for the larger of the pair
  const sPair = 160 / maxPairM;
  const pairEarthR = (earthDiameterM * sPair) / 2;
  const pairActiveR = (activeDiameterM * sPair) / 2;

  // PERSPECTIVE 2: Human & Environment Scale (1.8m Human + Earth + Planet)
  // Human (1.8m), Earth, and Selected Planet ALL share the exact same scale factor S_human:
  const maxHumanSceneM = Math.max(humanHeightM, earthDiameterM, activeDiameterM) * 1.15;
  // Reserve 170px max vertical height from baseline
  const sHuman = 170 / maxHumanSceneM;
  const humanPxH = humanHeightM * sHuman;
  const humanEarthR = (earthDiameterM * sHuman) / 2;
  const humanActiveR = (activeDiameterM * sHuman) / 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-border/70 bg-space-deep/95 p-4 sm:p-6 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
                  Visual Scale Pedestal
                  <span className="rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 font-mono text-[10px] text-cyan-400">
                    True Proportional Scale
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Mathematically exact side-by-side physical comparisons with zero border distortion.
                </DialogDescription>
              </div>
            </div>

            {/* Earth Reference Preset Selector */}
            <div className="flex items-center gap-1 rounded-full bg-secondary/30 p-1 border border-border/50">
              {(["1cm", "10cm", "25cm"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setEarthReference(preset)}
                  className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-mono transition-all ${
                    earthReference === preset
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={`Earth = ${REFERENCE_OPTIONS.find((o) => o.id === preset)?.note}`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* View Mode Tabs: Interactive Stage vs All Planets Overview */}
        <div className="flex items-center justify-between border-b border-border/40 pb-2 pt-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("stage")}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "stage"
                  ? "bg-secondary text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Interactive Stage
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all-planets")}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                activeTab === "all-planets"
                  ? "bg-secondary text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Planets Lineup
            </button>
          </div>

          {onOpenCityWalk && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onOpenCityWalk();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-900/50 transition-colors"
            >
              <Footprints className="h-3.5 w-3.5" />
              <span>Walk the Solar System</span>
            </button>
          )}
        </div>

        {activeTab === "stage" ? (
          <div className="space-y-4">
            {/* Celestial Body Quick Selector Pills with Active Indicators */}
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                  Select Planet or Moon to Inspect:
                </span>
                <span className="font-mono text-[10px] text-cyan-300">
                  Currently Comparing: <strong className="text-foreground">{bodyMeta.name}</strong>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {BODY_ORDER.map((id) => {
                  const b = BODIES[id];
                  const isSelected = activeId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectBody(id)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground font-bold shadow-md scale-105 ring-2 ring-primary/40"
                          : "border-border/50 bg-secondary/25 text-muted-foreground hover:text-foreground hover:bg-secondary/50 hover:border-border"
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full shadow-xs"
                        style={{ backgroundColor: b.color }}
                      />
                      <span>{b.name}</span>
                      {isSelected && (
                        <span className="ml-0.5 rounded-full bg-white/20 px-1 py-0.2 font-mono text-[9px]">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Comparison Stage Card */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-space-deep/80 p-4 shadow-inner">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono text-[11px] uppercase tracking-wider text-primary font-semibold flex items-center gap-1.5">
                  <Ruler className="h-3.5 w-3.5" /> Proportional Stage
                </span>

                {/* Perspective View Switcher */}
                <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-secondary/30 p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewPerspective("pair")}
                    className={`flex cursor-pointer items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
                      viewPerspective === "pair"
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Direct 1:1 true relative comparison between Earth and the selected body"
                  >
                    <Scale className="h-3 w-3" />
                    <span>Direct Planet vs Earth</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewPerspective("human")}
                    className={`flex cursor-pointer items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-all ${
                      viewPerspective === "human"
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="True scale comparison standing next to a 1.8m adult human"
                  >
                    <User className="h-3 w-3" />
                    <span>With 1.8m Human</span>
                  </button>
                </div>
              </div>

              {/* PERSPECTIVE 1: DIRECT PLANET VS EARTH (1:1 TRUE PROPORTION) */}
              {viewPerspective === "pair" ? (
                <div className="relative flex flex-col items-center justify-center rounded-lg border border-border/30 bg-radial from-secondary/20 via-secondary/5 to-transparent p-4">
                  <svg
                    className="h-64 w-full overflow-visible"
                    viewBox="0 0 700 240"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Shared Baseline Pedestal Line */}
                    <line
                      x1="40"
                      y1="210"
                      x2="660"
                      y2="210"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="40"
                      y="228"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      SHARED PEDESTAL BASELINE (1:1 TRUE PROPORTION)
                    </text>

                    {/* LEFT: BENCHMARK EARTH CIRCLE (PLAIN CIRCULAR DISC - NO BORDER) */}
                    <g transform={`translate(220, ${210 - pairEarthR})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={pairEarthR}
                        fill="#0284c7"
                        stroke="none"
                      />
                      <text
                        x="0"
                        y={-pairEarthR - 12}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="13"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Earth Benchmark
                      </text>
                      <text
                        x="0"
                        y={-pairEarthR - 28}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontFamily="monospace"
                      >
                        {earthDiameterCm.toFixed(1)} cm (100%)
                      </text>
                      <text
                        x="0"
                        y={-pairEarthR - 44}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="sans-serif"
                      >
                        {earthObj.icon} {earthObj.name}
                      </text>
                    </g>

                    {/* CENTER: VS DIVIDER */}
                    <text
                      x="350"
                      y="140"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.25)"
                      fontSize="15"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      VS
                    </text>

                    {/* RIGHT: SELECTED BODY CIRCLE (PLAIN CIRCULAR DISC - NO BORDER) */}
                    <g transform={`translate(480, ${210 - pairActiveR})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={pairActiveR}
                        fill={bodyMeta.color}
                        stroke="none"
                      />
                      <text
                        x="0"
                        y={-pairActiveR - 12}
                        textAnchor="middle"
                        fill={bodyMeta.color}
                        fontSize="14"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {bodyMeta.name}
                      </text>
                      <text
                        x="0"
                        y={-pairActiveR - 28}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {diameterCm >= 1
                          ? `${diameterCm.toFixed(1)} cm`
                          : `${(diameterCm * 10).toFixed(1)} mm`}{" "}
                        ({(earthRatio * 100).toFixed(1)}%)
                      </text>
                      <text
                        x="0"
                        y={-pairActiveR - 44}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="sans-serif"
                      >
                        {activeObj.icon} {activeObj.name}
                      </text>
                    </g>
                  </svg>
                </div>
              ) : (
                /* PERSPECTIVE 2: STANDING HUMAN (1.8m) + EARTH + SELECTED PLANET */
                <div className="relative flex flex-col items-center justify-center rounded-lg border border-border/30 bg-radial from-secondary/15 to-transparent p-4">
                  <svg
                    className="h-64 w-full overflow-visible"
                    viewBox="0 0 700 240"
                    preserveAspectRatio="xMidYMax meet"
                  >
                    {/* Shared Ground Line */}
                    <line
                      x1="20"
                      y1="210"
                      x2="680"
                      y2="210"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5"
                    />
                    <text
                      x="24"
                      y="228"
                      fill="rgba(255,255,255,0.4)"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      GROUND LEVEL (SHARED SCALE FACTOR FOR ALL 3 FIGURES)
                    </text>

                    {/* 1. ADULT HUMAN SILHOUETTE (1.8m) */}
                    <g transform={`translate(140, ${210 - humanPxH})`}>
                      {/* Head */}
                      <circle
                        cx="0"
                        cy={humanPxH * 0.12}
                        r={Math.max(2, humanPxH * 0.1)}
                        fill="#94a3b8"
                        stroke="none"
                        opacity="0.9"
                      />
                      {/* Torso */}
                      <rect
                        x={-Math.max(1, humanPxH * 0.08)}
                        y={humanPxH * 0.22}
                        width={Math.max(2, humanPxH * 0.16)}
                        height={humanPxH * 0.45}
                        rx="2"
                        fill="#94a3b8"
                        stroke="none"
                        opacity="0.85"
                      />
                      {/* Left Leg */}
                      <line
                        x1={-Math.max(1, humanPxH * 0.04)}
                        y1={humanPxH * 0.67}
                        x2={-Math.max(1, humanPxH * 0.05)}
                        y2={humanPxH}
                        stroke="#94a3b8"
                        strokeWidth={Math.max(1, humanPxH * 0.04)}
                      />
                      {/* Right Leg */}
                      <line
                        x1={Math.max(1, humanPxH * 0.04)}
                        y1={humanPxH * 0.67}
                        x2={Math.max(1, humanPxH * 0.05)}
                        y2={humanPxH}
                        stroke="#94a3b8"
                        strokeWidth={Math.max(1, humanPxH * 0.04)}
                      />
                      <text
                        x="0"
                        y="-8"
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Human (1.8m)
                      </text>
                    </g>

                    {/* 2. BENCHMARK EARTH (PLAIN CIRCULAR DISC - NO BORDER) */}
                    <g transform={`translate(310, ${210 - humanEarthR})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.max(1, humanEarthR)}
                        fill="#0284c7"
                        stroke="none"
                      />
                      <text
                        x="0"
                        y={-humanEarthR - 10}
                        textAnchor="middle"
                        fill="#38bdf8"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        Earth
                      </text>
                      <text
                        x="0"
                        y={-humanEarthR - 22}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {earthDiameterCm.toFixed(1)} cm
                      </text>
                    </g>

                    {/* 3. SELECTED CELESTIAL BODY (PLAIN CIRCULAR DISC - NO BORDER) */}
                    <g transform={`translate(520, ${210 - humanActiveR})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r={Math.max(1, humanActiveR)}
                        fill={bodyMeta.color}
                        stroke="none"
                      />
                      <text
                        x="0"
                        y={-humanActiveR - 10}
                        textAnchor="middle"
                        fill={bodyMeta.color}
                        fontSize="12"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {bodyMeta.name}
                      </text>
                      <text
                        x="0"
                        y={-humanActiveR - 22}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        {diameterCm >= 1
                          ? `${diameterCm.toFixed(1)} cm`
                          : `${(diameterCm * 10).toFixed(1)} mm`}{" "}
                        ({(earthRatio * 100).toFixed(1)}%)
                      </text>
                      <text
                        x="0"
                        y={-humanActiveR - 34}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                      >
                        {activeObj.icon} {activeObj.name}
                      </text>
                    </g>
                  </svg>
                </div>
              )}

              {/* Dynamic Comparison Cards */}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {/* Physical Object Match Card */}
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 flex items-center gap-3">
                  <span className="text-3xl shrink-0" role="img" aria-label={activeObj.name}>
                    {activeObj.icon}
                  </span>
                  <div>
                    <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider block">
                      Everyday Object Match
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">
                      {activeObj.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {activeObj.description} (~{formatModelLength(activeObj.typicalDiameterM)})
                    </p>
                  </div>
                </div>

                {/* Proportional Metric Card */}
                <div className="rounded-lg border border-border/50 bg-secondary/20 p-3 space-y-1">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider block">
                    Scaled Size Metrics (Exact Proportion)
                  </span>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Model Diameter:</span>
                    <span className="font-bold text-foreground">
                      {formatModelLength(activeDiameterM)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Vs Earth Size:</span>
                    <span className="font-semibold text-cyan-400">
                      {(earthRatio * 100).toFixed(1)}% of Earth
                      {earthRatio >= 1 ? ` (${earthRatio.toFixed(1)}×)` : ""}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground">Real Astronomical Diameter:</span>
                    <span className="text-muted-foreground">
                      {(bodyMeta.diameterM / 1_000).toLocaleString()} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Tangible Perspective Intuition */}
              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/10 p-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-primary font-bold flex items-center gap-1.5 mb-1">
                  <Eye className="h-3.5 w-3.5" /> Tangible Sensory Perspective
                </span>
                <p className="text-xs leading-relaxed text-foreground">
                  {getSensoryIntuition(activeId)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* All Planets Lineup Table */
          <div className="space-y-3">
            <div className="rounded-xl border border-border/60 bg-space-deep/80 p-3 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground">
                    <th className="pb-2 font-semibold">Celestial Body</th>
                    <th className="pb-2 font-semibold">Model Size</th>
                    <th className="pb-2 font-semibold">Everyday Object</th>
                    <th className="pb-2 font-semibold">Vs Earth</th>
                    <th className="pb-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {BODY_ORDER.map((id) => {
                    const b = BODIES[id];
                    const diamM = b.diameterM * k;
                    const obj = getClosestEverydayObject(diamM);
                    const ratio = b.diameterM / BODIES.earth.diameterM;

                    return (
                      <tr
                        key={id}
                        className={`hover:bg-secondary/30 transition-colors ${
                          activeId === id ? "bg-primary/15" : ""
                        }`}
                      >
                        <td className="py-2.5 font-sans font-medium text-foreground flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: b.color }}
                          />
                          <span>{b.name}</span>
                        </td>
                        <td className="py-2.5 text-foreground font-semibold">
                          {formatModelLength(diamM)}
                        </td>
                        <td className="py-2.5 text-cyan-300">
                          <span className="mr-1">{obj.icon}</span>
                          {obj.name}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {ratio >= 1 ? `${ratio.toFixed(1)}×` : `${(ratio * 100).toFixed(1)}%`}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectBody(id);
                              setActiveTab("stage");
                            }}
                            className="cursor-pointer rounded bg-secondary/50 px-2 py-1 text-[10px] font-sans font-medium text-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
