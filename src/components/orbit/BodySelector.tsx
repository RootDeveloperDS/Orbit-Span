import { BODIES, BODY_ORDER } from "@/lib/orbit/constants";
import { useOrbitStore } from "@/store/useOrbitStore";

export function BodySelector() {
  const selectedBody = useOrbitStore((s) => s.selectedBody);
  const selectBody = useOrbitStore((s) => s.selectBody);

  return (
    <div className="glass-panel space-y-2 p-3">
      <span className="instrument-label">Body</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select a body">
        {BODY_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={selectedBody === id}
            onClick={() => selectBody(id)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              selectedBody === id
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: BODIES[id].color }}
            />
            {BODIES[id].name}
          </button>
        ))}
      </div>
    </div>
  );
}
