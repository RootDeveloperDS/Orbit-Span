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
import { useOrbitStore } from "@/store/useOrbitStore";

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

      <ScaleRuler bodies={model} />

      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {model.map((body) => (
          <li
            key={body.id}
            className={`glass-panel p-3 ${body.id === selectedBody ? "ring-1 ring-primary/50" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: BODIES[body.id].color }}
              />
              <h3 className="text-sm font-medium">{body.name}</h3>
            </div>
            <dl className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Model distance</dt>
                <dd className="font-mono text-foreground">
                  {formatModelLength(body.modelDistanceM)}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Model diameter</dt>
                <dd className="font-mono">{formatModelLength(body.modelDiameterM)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Real distance</dt>
                <dd className="font-mono">{formatDistance(body.realDistanceM)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        With a 10 cm Earth (roughly a fist), the Moon sits about 3 m away, the Sun a little over 1 km,
        and the outer planets tens of kilometres out. Those figures are computed from live positions,
        not stored, so they change as the planets orbit.
      </p>
    </div>
  );
}
