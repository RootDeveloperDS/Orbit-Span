import { toScientificParts } from "@/lib/orbit/physics";

/** Accessible scientific-notation value: visual superscript + spoken text. */
export function SciValue({ value, unit, digits = 3 }: { value: number; unit?: string; digits?: number }) {
  if (!Number.isFinite(value)) return <span aria-label="not available">—</span>;
  const parts = toScientificParts(value, digits);
  const spoken = `${parts.spoken}${unit ? ` ${unit}` : ""}`;

  return (
    <span className="font-mono">
      <span className="sr-only">{spoken}</span>
      <span aria-hidden="true">
        {parts.mantissa} × 10<sup className="text-[0.7em]">{parts.exponent}</sup>
        {unit ? ` ${unit}` : ""}
      </span>
    </span>
  );
}
