import { Footprints, Car, Plane, Sparkles, Orbit, Compass, Ruler } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BODIES, BODY_ORDER, EARTH_MEAN_DIAMETER_M, type BodyId } from "@/lib/orbit/constants";
import type { SolarSystemState } from "@/lib/orbit/ephemeris";
import { formatDistance } from "@/lib/orbit/physics";
import {
  REFERENCE_OPTIONS,
  buildScaledModel,
  formatModelLength,
  scaleFactor,
  walkingMinutes,
} from "@/lib/orbit/scale";
import {
  getClosestEverydayObject,
  computeJourneyTimes,
  formatHumanDuration,
  CITY_ANALOGIES,
} from "@/lib/orbit/humanScaleData";
import { useOrbitStore } from "@/store/useOrbitStore";
import { VisualPedestalModal } from "./human/VisualPedestalModal";
import { CityJourneyModal } from "./human/CityJourneyModal";


/** Resolved Earth reference diameter in metres from the current store state. */
function useReferenceDiameter(): number {
  const earthReference = useOrbitStore((s) => s.earthReference);
  const custom = useOrbitStore((s) => s.customEarthDiameterM);
  if (earthReference === "custom") return Math.max(custom, 0.001);
  return REFERENCE_OPTIONS.find((o) => o.id === earthReference)?.metres ?? 0.1;
}

function ReferencePicker() {
  const earthReference = useOrbitStore((s) => s.earthReference);
  const setEarthReference = useOrbitStore((s) => s.setEarthReference);
  const custom = useOrbitStore((s) => s.customEarthDiameterM);
  const setCustom = useOrbitStore((s) => s.setCustomEarthDiameterM);

  return (
    <div className="glass-panel space-y-3 p-4">
      <span className="instrument-label">Earth reference diameter</span>
      <div className="flex flex-wrap gap-1.5">
        {REFERENCE_OPTIONS.map((option) => (
          <Button
            key={option.id}
            size="sm"
            variant={earthReference === option.id ? "default" : "outline"}
            className="h-8 text-xs"
            aria-pressed={earthReference === option.id}
            onClick={() => setEarthReference(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      {earthReference === "custom" ? (
        <div className="space-y-1.5">
          <Label htmlFor="custom-earth" className="instrument-label">
            Custom Earth diameter (cm)
          </Label>
          <Input
            id="custom-earth"
            type="number"
            min={0.1}
            max={500}
            step={0.5}
            className="font-mono"
            value={(custom * 100).toString()}
            onChange={(e) => {
              const cm = Number(e.target.value);
              if (Number.isFinite(cm) && cm > 0) setCustom(cm / 100);
            }}
          />
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          {REFERENCE_OPTIONS.find((o) => o.id === earthReference)?.note}
        </p>
      )}
    </div>
  );
}

function ScaleRuler({ bodies }: { bodies: { id: BodyId; modelDistanceM: number }[] }) {
  const max = Math.max(...bodies.map((b) => b.modelDistanceM), 1);
  return (
    <div className="glass-panel space-y-2 p-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Measurement space</h2>
        <span className="instrument-label">square-root spacing</span>
      </div>
      <div className="relative h-24 w-full overflow-hidden rounded-md border border-border/60 bg-space-deep/60">
        <div className="absolute top-1/2 left-0 h-px w-full bg-border" aria-hidden="true" />
        {bodies.map((b) => {
          const t = Math.sqrt(b.modelDistanceM / max);
          return (
            <div
              key={b.id}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${2 + t * 94}%` }}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: BODIES[b.id].color }}
                aria-hidden="true"
              />
              <span className="absolute top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] whitespace-nowrap text-muted-foreground">
                {BODIES[b.id].name}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground">
        A literal 3D world tens of kilometres wide cannot be rendered usefully, so model distances are
        shown as a measured scale space plus the distance cards below.
      </p>
    </div>
  );
}

export function HumanScalePanel({ state }: { state: SolarSystemState }) {
  const reference = useReferenceDiameter();
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const setSelectedBody = useOrbitStore((s) => s.setSelectedBody);
  const isPedestalModalOpen = useOrbitStore((s) => s.isPedestalModalOpen);
  const setIsPedestalModalOpen = useOrbitStore((s) => s.setIsPedestalModalOpen);
  const isCityWalkModalOpen = useOrbitStore((s) => s.isCityWalkModalOpen);
  const setIsCityWalkModalOpen = useOrbitStore((s) => s.setIsCityWalkModalOpen);
  const ids = BODY_ORDER.filter((id) => id !== "earth");
  const distances = Object.fromEntries(
    ids.map((id) => [id, state.bodies[id].distanceFromEarthM]),
  ) as Partial<Record<BodyId, number>>;
  const model = buildScaledModel(reference, distances, ids);
  const earthModel = buildScaledModel(reference, { earth: 0 }, ["earth"])[0]!;
  const k = scaleFactor(reference);

  return (
    <div className="space-y-3">
      <ReferencePicker />

      <div className="glass-panel grid gap-3 p-4 sm:grid-cols-3">
        <div>
          <span className="instrument-label">Model Earth</span>
          <p className="text-lg font-semibold">{formatModelLength(earthModel.modelDiameterM)}</p>
          <p className="text-[11px] text-muted-foreground">
            real {formatDistance(EARTH_MEAN_DIAMETER_M)}
          </p>
        </div>
        <div>
          <span className="instrument-label">Scale factor</span>
          <p className="font-mono text-lg font-semibold">1 : {Math.round(1 / k).toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">model length ÷ real length</p>
        </div>
        <div>
          <span className="instrument-label">Walk to model Sun</span>
          <p className="text-lg font-semibold">
            {walkingMinutes(model.find((m) => m.id === "sun")?.modelDistanceM ?? 0).toFixed(0)} min
          </p>
          <p className="text-[11px] text-muted-foreground">at a relaxed 1.4 m/s</p>
        </div>
      </div>

      {/* Journey & Travel Simulator */}
      <div className="glass-panel p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Real-World Human Journey Benchmark</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPedestalModalOpen(true)}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-primary/40 bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/25 transition-colors"
            >
              <Ruler className="h-3 w-3" /> Visual Pedestal
            </button>
            <button
              type="button"
              onClick={() => setIsCityWalkModalOpen(true)}
              className="flex cursor-pointer items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-900/50 transition-colors"
            >
              <Footprints className="h-3 w-3" /> Walk the Solar System
            </button>
            <Link
              to="/"
              className="flex items-center gap-1 rounded-md border border-border/60 bg-secondary/30 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Orbit className="h-3 w-3" /> 3D View
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          If you were to walk, drive, or fly through space at human speeds at this scale:
        </p>

        <div className="grid gap-2 sm:grid-cols-3">
          {CITY_ANALOGIES.map((analogy) => (
            <div key={analogy.referenceName} className="rounded-lg border border-border/40 bg-secondary/20 p-2.5 text-xs space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1">
                📍 {analogy.referenceName} Walk
              </span>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sun: <span className="text-foreground">{analogy.sunLocation}</span><br />
                Earth: <span className="text-foreground">{analogy.earthLocation}</span><br />
                Jupiter: <span className="text-foreground">{analogy.jupiterLocation}</span><br />
                Neptune: <span className="text-foreground">{analogy.neptuneLocation}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <ScaleRuler bodies={model} />

      {/* Grid of Celestial Bodies with Everyday Object Badges */}
      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {model.map((body) => {
          const obj = getClosestEverydayObject(body.modelDiameterM);
          const journey = computeJourneyTimes(body.modelDistanceM, body.realDistanceM, reference);

          return (
            <li
              key={body.id}
              className={`glass-panel p-3.5 space-y-2.5 transition-all ${
                body.id === selectedBody ? "ring-1 ring-primary/60 shadow-lg" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: BODIES[body.id].color, color: BODIES[body.id].color }}
                  />
                  <h3 className="text-sm font-semibold text-foreground">{body.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBody(body.id);
                    setIsPedestalModalOpen(true);
                  }}
                  className="flex cursor-pointer items-center gap-1 rounded bg-secondary/50 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 hover:bg-primary/20 hover:text-primary transition-colors"
                  title="Compare on Visual Scale Pedestal"
                >
                  <span>{obj.icon}</span> {obj.name}
                </button>
              </div>

              <dl className="space-y-1 text-xs">
                <div className="flex justify-between gap-2 border-b border-border/30 pb-1">
                  <dt className="text-muted-foreground">Model diameter</dt>
                  <dd className="font-mono font-medium text-foreground">{formatModelLength(body.modelDiameterM)}</dd>
                </div>
                <div className="flex justify-between gap-2 border-b border-border/30 pb-1">
                  <dt className="text-muted-foreground">Model distance from Earth</dt>
                  <dd className="font-mono font-medium text-primary">{formatModelLength(body.modelDistanceM)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Real astronomical distance</dt>
                  <dd className="font-mono text-muted-foreground">{formatDistance(body.realDistanceM)}</dd>
                </div>
              </dl>

              {/* Travel times */}
              <div className="rounded-md bg-secondary/20 p-2 text-[11px] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                    <Footprints className="h-2.5 w-2.5 text-emerald-400" /> Walking
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatHumanDuration(journey.walkingSec)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                    <Car className="h-2.5 w-2.5 text-cyan-400" /> 100 km/h car
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    {formatHumanDuration(journey.carSec)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        With a 10 cm Earth (roughly a clenched fist), the Moon sits about 3 m away, the Sun a little over 1 km,
        and the outer planets tens of kilometres out. Those figures are computed live from real ephemeris coordinates,
        so they shift continuously as the celestial bodies follow their orbits.
      </p>

      {/* Visual Pedestal Modal */}
      <VisualPedestalModal
        open={isPedestalModalOpen}
        onOpenChange={setIsPedestalModalOpen}
        onOpenCityWalk={() => setIsCityWalkModalOpen(true)}
      />

      {/* City Walk Modal */}
      <CityJourneyModal
        open={isCityWalkModalOpen}
        onOpenChange={setIsCityWalkModalOpen}
        onOpenPedestal={() => setIsPedestalModalOpen(true)}
      />
    </div>
  );
}

