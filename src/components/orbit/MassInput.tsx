import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrbitStore } from "@/store/useOrbitStore";

export function MassInput() {
  const observerMassKg = useOrbitStore((s) => s.observerMassKg);
  const setObserverMassKg = useOrbitStore((s) => s.setObserverMassKg);

  return (
    <div className="glass-panel space-y-2 p-3">
      <Label htmlFor="observer-mass" className="instrument-label">
        Your mass (kg)
      </Label>
      <Input
        id="observer-mass"
        type="number"
        inputMode="decimal"
        min={1}
        max={500}
        step={1}
        value={observerMassKg}
        onChange={(e) => setObserverMassKg(Number(e.target.value))}
        className="font-mono"
      />
      <p className="text-[11px] text-muted-foreground">
        Used only for force (F = m·a). Acceleration values are independent of it.
      </p>
    </div>
  );
}
