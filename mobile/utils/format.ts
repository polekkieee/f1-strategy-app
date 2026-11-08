// ASSUMPTION: lap times arrive in SECONDS. Change to 'ms' if your backend sends milliseconds.
export function formatLapTime(t: number): string {
  if (!t || t <= 0) return '--:--.---';
  const total = t;
  const m = Math.floor(total / 60);
  const s = (total % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

// ASSUMPTION: gaps in seconds, 0 = no car there
export const formatGap = (g: number, sign: '+' | '-') =>
  g > 0 ? `${sign}${g.toFixed(3)}` : '—';