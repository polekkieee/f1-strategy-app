import * as Haptics from "expo-haptics";
import { useSettingsStore } from "../store/useSettingsStore";
import { isSafetyCarActive, getSafetyCarType } from "../utils/tacticalAlerts";

export type TacticalHapticEvent = "BOX_THIS_LAP" | "SAFETY_CAR";

export interface HapticBackend {
  notificationAsync: (type: any) => Promise<void>;
  impactAsync: (style: any) => Promise<void>;
}

const defaultBackend: HapticBackend = {
  notificationAsync: async (type) => {
    await Haptics.notificationAsync(type);
  },
  impactAsync: async (style) => {
    await Haptics.impactAsync(style);
  },
};

export async function triggerTacticalHaptic(
  event: TacticalHapticEvent,
  backend: HapticBackend = defaultBackend
): Promise<void> {
  const enabled = useSettingsStore.getState().enableHapticAlerts;
  if (!enabled) return;

  try {
    if (event === "BOX_THIS_LAP") {
      await backend.impactAsync(Haptics.ImpactFeedbackStyle?.Heavy ?? "heavy");
      await backend.notificationAsync(
        Haptics.NotificationFeedbackType?.Warning ?? "warning"
      );
    } else if (event === "SAFETY_CAR") {
      await backend.notificationAsync(
        Haptics.NotificationFeedbackType?.Warning ?? "warning"
      );
      await backend.impactAsync(
        Haptics.ImpactFeedbackStyle?.Medium ?? "medium"
      );
    }
  } catch {
    // Gracefully ignore haptic failures on unsupported platforms or environments
  }
}

export interface TacticalStateSnapshot {
  safetyCarStatus: string | null | undefined;
  isBoxThisLap: boolean;
  planKey?: string | number | null;
}

export function evaluateHapticTransitions(
  prev: TacticalStateSnapshot,
  next: TacticalStateSnapshot
): TacticalHapticEvent[] {
  const events: TacticalHapticEvent[] = [];

  const prevScActive = isSafetyCarActive(prev.safetyCarStatus);
  const nextScActive = isSafetyCarActive(next.safetyCarStatus);
  const prevScType = getSafetyCarType(prev.safetyCarStatus);
  const nextScType = getSafetyCarType(next.safetyCarStatus);

  // Transition into active SC/VSC, between SC and VSC, or return-to-green phase change
  if (
    (!prevScActive && nextScActive) ||
    (prevScActive && nextScActive && prevScType !== nextScType) ||
    (prevScActive && !nextScActive)
  ) {
    events.push("SAFETY_CAR");
  }

  // Transition into "BOX THIS LAP" call, or receiving a new plan call recommending box this lap
  if (
    next.isBoxThisLap &&
    (!prev.isBoxThisLap ||
      (prev.planKey !== next.planKey && next.planKey !== null))
  ) {
    events.push("BOX_THIS_LAP");
  }

  return events;
}
