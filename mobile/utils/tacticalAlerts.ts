export type SafetyCarType = "SC" | "VSC";

const ACTIONABLE_PENALTY_SUBSTRINGS = ["drive through", "stop and go"];

/**
 * Filter an array of penalties to only include actionable driver penalties
 * ("Drive through", "Stop and go"), ignoring numeric time penalties.
 */
export function getActionablePenalties(
  penalties: readonly string[] | null | undefined
): string[] {
  if (!penalties || !Array.isArray(penalties)) return [];
  return penalties.filter((p) => {
    if (typeof p !== "string") return false;
    const lower = p.trim().toLowerCase();
    return ACTIONABLE_PENALTY_SUBSTRINGS.some((sub) => lower.includes(sub));
  });
}

/**
 * Determines whether the player is currently in the process of pitting.
 */
export function isPitting(pitStatus: string | null | undefined): boolean {
  if (!pitStatus || typeof pitStatus !== "string") return false;
  return pitStatus.trim().toLowerCase() === "pitting";
}

/**
 * Checks if an active Full Safety Car or Virtual Safety Car is deployed.
 */
export function isSafetyCarActive(
  safetyCarStatus: string | null | undefined
): boolean {
  return getSafetyCarType(safetyCarStatus) !== null;
}

/**
 * Resolves whether the active safety car is "SC" (Full Safety Car) or "VSC" (Virtual Safety Car).
 * Returns null if no safety car is deployed, or on formation lap.
 */
export function getSafetyCarType(
  safetyCarStatus: string | null | undefined
): SafetyCarType | null {
  if (!safetyCarStatus || typeof safetyCarStatus !== "string") return null;
  const s = safetyCarStatus.trim().toLowerCase();
  if (
    s === "no safety car" ||
    s === "none" ||
    s === "formation lap safety car" ||
    s.includes("formation") ||
    s.includes("no safety")
  ) {
    return null;
  }
  if (s === "vsc" || s.includes("virtual safety car")) {
    return "VSC";
  }
  if (s === "sc" || s.includes("safety car")) {
    return "SC";
  }
  return null;
}

/**
 * Checks whether the current AI strategy call recommends boxing on the current lap.
 */
export function isBoxThisLap(
  lapToBox: number | null | undefined,
  currentLap: number | null | undefined
): boolean {
  if (
    typeof lapToBox !== "number" ||
    typeof currentLap !== "number" ||
    lapToBox <= 0 ||
    currentLap <= 0
  ) {
    return false;
  }
  return lapToBox === currentLap;
}
