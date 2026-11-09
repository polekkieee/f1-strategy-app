// ASSUMPTION: lap times arrive in SECONDS. Change to 'ms' if your backend sends milliseconds.
export function formatLapTime(t: number): string {
  if (!t || t <= 0) return "--:--.---";
  const total = t;
  const m = Math.floor(total / 60);
  const s = (total % 60).toFixed(3).padStart(6, "0");
  return `${m}:${s}`;
}

// ASSUMPTION: gaps in seconds, 0 = no car there
export const formatGap = (g: number, sign: "+" | "-") =>
  g > 0 ? `${sign}${g.toFixed(3)}` : "—";

export function formatCompound(visual?: string, actual?: string): string {
  const v = (visual || "").trim();
  const a = (actual || "").trim();

  if (v && a && v.toUpperCase() !== a.toUpperCase()) {
    return `${v} (${a})`;
  }
  return v || a || "—";
}

export function formatTyreAgeDisplay(
  age: number,
  visualCompound: string,
  actualCompound: string,
  showActual: boolean
): string {
  const visual = (visualCompound || "").trim();
  const actual = (actualCompound || "").trim();
  const ageLabel = `${age} ${age === 1 ? "LAP" : "LAPS"}`;

  if (showActual && actual && actual.toUpperCase() !== visual.toUpperCase()) {
    const visualPrefix = visual ? `${visual.toUpperCase()} ` : "";
    return `${visualPrefix}(${actual.toUpperCase()}) · ${ageLabel}`;
  }

  return ageLabel;
}
