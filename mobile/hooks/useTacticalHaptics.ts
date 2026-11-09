import { useEffect, useRef } from "react";
import { useRaceStore } from "../store/useRaceStore";
import { useStrategyStore } from "../store/useStrategyStore";
import { isBoxThisLap } from "../utils/tacticalAlerts";
import {
  evaluateHapticTransitions,
  triggerTacticalHaptic,
  TacticalStateSnapshot,
} from "../services/haptics";

export function useTacticalHaptics() {
  const safetyCarStatus = useRaceStore((s) => s.safetyCarStatus);
  const currentLap = useRaceStore((s) => s.currentLap);
  const plan = useStrategyStore((s) => s.plan);

  const boxThisLap = isBoxThisLap(plan?.lapToBox, currentLap);
  const planKey = plan
    ? `${plan.generatedAtLap}-${plan.lapToBox}-${plan.newTires}`
    : null;

  const prevRef = useRef<TacticalStateSnapshot>({
    safetyCarStatus,
    isBoxThisLap: boxThisLap,
    planKey,
  });

  useEffect(() => {
    const currentSnapshot: TacticalStateSnapshot = {
      safetyCarStatus,
      isBoxThisLap: boxThisLap,
      planKey,
    };

    const events = evaluateHapticTransitions(prevRef.current, currentSnapshot);
    for (const evt of events) {
      void triggerTacticalHaptic(evt);
    }

    prevRef.current = currentSnapshot;
  }, [safetyCarStatus, boxThisLap, planKey]);
}
