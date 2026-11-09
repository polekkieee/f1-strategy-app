import { colors } from "../ui/theme";

export type FuelStatus = "deficit" | "caution" | "safe";

export const FUEL_STATUS_COLORS: Record<FuelStatus, string> = {
  deficit: colors.bad,
  caution: colors.warn,
  safe: colors.good,
};

export function roundFuelMargin(margin: number): number {
  if (isNaN(margin)) return 0;
  const rounded = Number(margin.toFixed(1));
  return Math.abs(rounded) === 0 ? 0 : rounded;
}

export function formatFuelMargin(margin: number): string {
  const rounded = roundFuelMargin(margin);
  const sign = rounded >= 0 ? "+" : "";
  return `${sign}${rounded.toFixed(1)} laps`;
}

export function getFuelStatus(margin: number): FuelStatus {
  const rounded = roundFuelMargin(margin);
  if (rounded < 0.0) {
    return "deficit";
  }
  if (rounded <= 0.5) {
    return "caution";
  }
  return "safe";
}

export function getFuelThreshold(margin: number): {
  status: FuelStatus;
  color: string;
} {
  const status = getFuelStatus(margin);
  return {
    status,
    color: FUEL_STATUS_COLORS[status],
  };
}
