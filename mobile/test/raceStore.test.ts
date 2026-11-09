import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { useRaceStore } from "../store/useRaceStore";
import { formatCompound, formatTyreAgeDisplay } from "../utils/format";

describe("useRaceStore & Schema Synchronization", () => {
  beforeEach(() => {
    useRaceStore.setState({
      timestamp: 0,
      sessionStatus: "active",
      trackName: "",
      sessionType: "",
      totalLaps: 0,
      pitStopWindowIdealLap: 0,
      pitStatus: "",
      numPitStopsTaken: 0,
      weather: "",
      weatherForecast: [],
      forecastAccuracy: "",
      safetyCarStatus: "",
      currentLap: 0,
      playerPosition: 0,
      gapAhead: 0,
      carAheadLastLapTime: 0,
      gapBehind: 0,
      carBehindLastLapTime: 0,
      lastLapTime: 0,
      lapTimeHistory: [],
      bestLapTime: 0,
      carAheadActualTyreCompound: "",
      carAheadVisualTyreCompound: "",
      carAheadTireCompound: "",
      carAheadTireAgeLaps: 0,
      carBehindActualTyreCompound: "",
      carBehindVisualTyreCompound: "",
      carBehindTireCompound: "",
      carBehindTireAgeLaps: 0,
      actualTyreCompound: "",
      visualTyreCompound: "",
      tireCompound: "",
      tireWearLF: 0,
      tireWearRF: 0,
      tireWearLR: 0,
      tireWearRR: 0,
      tireAgeLaps: 0,
      ersStorage: 0,
      fuelRemainingLaps: 0,
      carDamage: [],
      playerPenalties: [],
      totalPenaltySeconds: 0,
      availableTires: [],
      isConnected: false,
      lastUpdateMs: 0,
    });
  });

  it("initial state includes actual tyre compounds, session status, and visual compounds", () => {
    const state = useRaceStore.getState();
    assert.equal(state.sessionStatus, "active");
    assert.equal(state.actualTyreCompound, "");
    assert.equal(state.visualTyreCompound, "");
    assert.equal(state.carAheadActualTyreCompound, "");
    assert.equal(state.carAheadVisualTyreCompound, "");
    assert.equal(state.carBehindActualTyreCompound, "");
    assert.equal(state.carBehindVisualTyreCompound, "");
  });

  it("parses telemetry updates for actual compounds, sessionStatus, and maintains dual compound sync", () => {
    useRaceStore.getState().updateTelemetry({
      timestamp: 1000,
      sessionStatus: "active",
      actualTyreCompound: "C3",
      visualTyreCompound: "Soft",
      carAheadActualTyreCompound: "C2",
      carAheadVisualTyreCompound: "Medium",
      carBehindActualTyreCompound: "C4",
      carBehindVisualTyreCompound: "Hard",
    });

    const state = useRaceStore.getState();
    assert.equal(state.actualTyreCompound, "C3");
    assert.equal(state.visualTyreCompound, "Soft");
    assert.equal(state.tireCompound, "Soft"); // legacy field synchronized
    assert.equal(state.carAheadActualTyreCompound, "C2");
    assert.equal(state.carAheadVisualTyreCompound, "Medium");
    assert.equal(state.carAheadTireCompound, "Medium");
    assert.equal(state.carBehindActualTyreCompound, "C4");
    assert.equal(state.carBehindVisualTyreCompound, "Hard");
    assert.equal(state.carBehindTireCompound, "Hard");
    assert.equal(state.sessionStatus, "active");

    // Session completion
    useRaceStore.getState().updateTelemetry({
      timestamp: 2000,
      sessionStatus: "completed",
    });
    assert.equal(useRaceStore.getState().sessionStatus, "completed");
  });

  it("preserves array reference memoization across updates when content is identical", () => {
    const initialDamage = ["Front Left Wing: 10", "Rear Wing: 5"];
    useRaceStore.getState().updateTelemetry({
      timestamp: 1000,
      carDamage: initialDamage,
    });

    const damageRefBefore = useRaceStore.getState().carDamage;
    assert.deepEqual(damageRefBefore, initialDamage);

    // Update with a new array instance having identical contents
    useRaceStore.getState().updateTelemetry({
      timestamp: 2000,
      carDamage: ["Front Left Wing: 10", "Rear Wing: 5"],
      actualTyreCompound: "C4",
    });

    const damageRefAfter = useRaceStore.getState().carDamage;
    assert.equal(
      damageRefAfter,
      damageRefBefore,
      "Array reference must remain memoized when content does not change"
    );
    assert.equal(useRaceStore.getState().actualTyreCompound, "C4");
  });

  it("memoizes selector updates for new actual compound and sessionStatus fields", () => {
    let callCount = 0;
    let selectedState: { actual: string; status: string } = {
      actual: "",
      status: "active",
    };

    const unsubscribe = useRaceStore.subscribe((state) => {
      if (
        state.actualTyreCompound !== selectedState.actual ||
        state.sessionStatus !== selectedState.status
      ) {
        callCount++;
        selectedState = {
          actual: state.actualTyreCompound,
          status: state.sessionStatus,
        };
      }
    });

    // Unrelated update (e.g. gapAhead, lastLapTime) should not trigger selector change
    useRaceStore.getState().updateTelemetry({
      timestamp: 3000,
      gapAhead: 1.45,
      lastLapTime: 82.5,
    });
    assert.equal(
      callCount,
      0,
      "Unrelated field updates must not trigger selector change"
    );

    // Updating actualTyreCompound triggers listener
    useRaceStore.getState().updateTelemetry({
      timestamp: 4000,
      actualTyreCompound: "C2",
    });
    assert.equal(callCount, 1);
    assert.equal(selectedState.actual, "C2");

    unsubscribe();
  });

  it("resolves dual compounds and formats Pirelli grade stamped alongside tyre age when enabled", () => {
    // formatCompound resolution tests
    assert.equal(formatCompound("Soft", "C3"), "Soft (C3)");
    assert.equal(formatCompound("Medium", "C2"), "Medium (C2)");
    assert.equal(formatCompound("Hard", "C1"), "Hard (C1)");
    assert.equal(formatCompound("Inter", "Inter"), "Inter");
    assert.equal(formatCompound("Wet", "Wet"), "Wet");
    assert.equal(formatCompound("Soft", ""), "Soft");
    assert.equal(formatCompound("", "C3"), "C3");

    // formatTyreAgeDisplay resolution tests
    // When enabled: specific Pirelli grade stamped alongside tyre age (e.g. SOFT (C3) · 12 LAPS)
    assert.equal(
      formatTyreAgeDisplay(12, "Soft", "C3", true),
      "SOFT (C3) · 12 LAPS"
    );
    assert.equal(
      formatTyreAgeDisplay(1, "Hard", "C1", true),
      "HARD (C1) · 1 LAP"
    );

    // When disabled (default): displays plain tyre age with consistent uppercase LAPS
    assert.equal(formatTyreAgeDisplay(12, "Soft", "C3", false), "12 LAPS");

    // When compound has no distinct Pirelli grade (e.g. Inter or Wet)
    assert.equal(formatTyreAgeDisplay(8, "Inter", "Inter", true), "8 LAPS");

    // When actual compound is missing/empty
    assert.equal(formatTyreAgeDisplay(5, "Medium", "", true), "5 LAPS");
  });
});
