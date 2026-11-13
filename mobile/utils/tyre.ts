import { colors } from "../ui/theme";

export const TYRE_TEMP_BANDS = {
  SUB_COOLING: {
    max: 85,
    color: "#38bdf8", // Sub-cooling blue
    label: "SUB-COOLING",
  },
  NOMINAL: {
    min: 85,
    max: 100,
    color: colors.good, // #22c55e Nominal green
    label: "NOMINAL",
  },
  BLISTERING: {
    min: 100,
    max: 105,
    color: colors.warn, // #f59e0b Blistering amber
    label: "BLISTERING",
  },
  CRITICAL: {
    min: 105,
    color: colors.bad, // #ef4444 Critical red
    label: "CRITICAL",
  },
};

/**
 * Classifies tyre temperature (Celsius) into chromatic thermal bands:
 * - Sub-cooling blue: < 85°C (specifically < 80°C sub-cooling, 80-85°C warm-up)
 * - Nominal green: 85°C - 100°C
 * - Blistering amber: > 100°C - 105°C
 * - Critical red: > 105°C
 */
export function getTyreTempColor(tempC: number): string {
  if (tempC > 105) {
    return colors.bad;
  }
  if (tempC > 100) {
    return colors.warn;
  }
  if (tempC >= 85) {
    return colors.good;
  }
  return "#38bdf8";
}

/**
 * Returns color coding for tyre wear:
 * - Green: < 50%
 * - Amber: 50% - 70%
 * - Red: >= 70%
 */
export function getTyreWearColor(wearPercent: number): string {
  if (wearPercent >= 70) {
    return colors.bad;
  }
  if (wearPercent >= 50) {
    return colors.warn;
  }
  return colors.good;
}

/**
 * Formats wear percentage deterministically (e.g. "12%")
 */
export function formatTyreWear(wearPercent: number): string {
  const safe = Math.max(0, Math.min(100, wearPercent || 0));
  return `${Math.round(safe)}%`;
}
