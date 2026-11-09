import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  evaluateHapticTransitions,
  triggerTacticalHaptic,
  type TacticalHapticEvent,
  type HapticBackend,
} from "../services/haptics";
import { useSettingsStore } from "../store/useSettingsStore";

function createMockBackend() {
  const calls: string[] = [];
  const backend: HapticBackend = {
    notificationAsync: async (type: string) => {
      calls.push(`notification:${type}`);
    },
    impactAsync: async (style: string) => {
      calls.push(`impact:${style}`);
    },
  };
  return { calls, backend };
}

describe("Tactical Haptics Engine (Seam 4)", () => {
  beforeEach(() => {
    useSettingsStore.setState({ enableHapticAlerts: true });
  });

  describe("triggerTacticalHaptic", () => {
    it("calls haptic backend when enableHapticAlerts is true", async () => {
      const { calls, backend } = createMockBackend();

      await triggerTacticalHaptic("BOX_THIS_LAP", backend);
      assert.ok(calls.length > 0);
      assert.ok(
        calls.some((c) => c.includes("notification") || c.includes("impact"))
      );
    });

    it("suppresses haptic pulses when enableHapticAlerts is disabled in settings", async () => {
      useSettingsStore.setState({ enableHapticAlerts: false });

      const { calls, backend } = createMockBackend();

      await triggerTacticalHaptic("SAFETY_CAR", backend);
      assert.equal(calls.length, 0);
    });
  });

  describe("evaluateHapticTransitions", () => {
    it("emits SAFETY_CAR trigger upon deployment of SC or VSC, and upon transition between SC types", () => {
      const events1 = evaluateHapticTransitions(
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: false,
          planKey: null,
        },
        {
          safetyCarStatus: "Virtual Safety Car",
          isBoxThisLap: false,
          planKey: null,
        }
      );
      assert.deepEqual(events1, ["SAFETY_CAR"]);

      const events2 = evaluateHapticTransitions(
        {
          safetyCarStatus: "Virtual Safety Car",
          isBoxThisLap: false,
          planKey: null,
        },
        {
          safetyCarStatus: "Full Safety Car",
          isBoxThisLap: false,
          planKey: null,
        }
      );
      assert.deepEqual(events2, ["SAFETY_CAR"]);
    });

    it("emits SAFETY_CAR trigger upon return-to-green phase change when SC ends", () => {
      const returnToGreen = evaluateHapticTransitions(
        {
          safetyCarStatus: "Full Safety Car",
          isBoxThisLap: false,
          planKey: null,
        },
        { safetyCarStatus: "No Safety Car", isBoxThisLap: false, planKey: null }
      );
      assert.deepEqual(returnToGreen, ["SAFETY_CAR"]);
    });

    it("does not emit SAFETY_CAR when status is unchanged or formation lap", () => {
      // Unchanged
      const unchanged = evaluateHapticTransitions(
        {
          safetyCarStatus: "Full Safety Car",
          isBoxThisLap: false,
          planKey: null,
        },
        {
          safetyCarStatus: "Full Safety Car",
          isBoxThisLap: false,
          planKey: null,
        }
      );
      assert.deepEqual(unchanged, []);

      // Formation lap
      const formation = evaluateHapticTransitions(
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: false,
          planKey: null,
        },
        {
          safetyCarStatus: "Formation Lap Safety Car",
          isBoxThisLap: false,
          planKey: null,
        }
      );
      assert.deepEqual(formation, []);
    });

    it("emits BOX_THIS_LAP trigger when transitioning to box recommendation or receiving a new plan", () => {
      const boxEvent = evaluateHapticTransitions(
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: false,
          planKey: "plan-1",
        },
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: true,
          planKey: "plan-1",
        }
      );
      assert.deepEqual(boxEvent, ["BOX_THIS_LAP"]);

      // Receiving updated strategy call while already on box lap
      const newPlanEvent = evaluateHapticTransitions(
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: true,
          planKey: "plan-1",
        },
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: true,
          planKey: "plan-2",
        }
      );
      assert.deepEqual(newPlanEvent, ["BOX_THIS_LAP"]);

      // Unchanged state should not re-trigger
      const duplicate = evaluateHapticTransitions(
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: true,
          planKey: "plan-1",
        },
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: true,
          planKey: "plan-1",
        }
      );
      assert.deepEqual(duplicate, []);

      // Transition to false should not trigger
      const clearBox = evaluateHapticTransitions(
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: true,
          planKey: "plan-1",
        },
        {
          safetyCarStatus: "No Safety Car",
          isBoxThisLap: false,
          planKey: "plan-1",
        }
      );
      assert.deepEqual(clearBox, []);
    });
  });
});
