import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { usePostRaceStore } from "../store/usePostRaceStore";
import { useRaceStore } from "../store/useRaceStore";
import { attachSessionLifecycleObserver } from "../hooks/useSessionLifecycle";

describe("Session Lifecycle Observer & Post-Race Store (Seam 1)", () => {
  beforeEach(() => {
    usePostRaceStore.getState().reset();
    useRaceStore.setState({
      sessionStatus: "active",
      playerPosition: 1,
      currentLap: 10,
      totalLaps: 50,
      totalPenaltySeconds: 0,
    });
  });

  it("initializes with isSummaryOpen = false and hasAutoOpened = false", () => {
    const state = usePostRaceStore.getState();
    assert.equal(state.isSummaryOpen, false);
    assert.equal(state.hasAutoOpened, false);
  });

  it("openSummary and closeSummary update isSummaryOpen", () => {
    const store = usePostRaceStore.getState();
    store.openSummary();
    assert.equal(usePostRaceStore.getState().isSummaryOpen, true);

    store.closeSummary();
    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);
  });

  it("handleSessionTransition triggers auto-open when transitioning from active to completed", () => {
    const store = usePostRaceStore.getState();
    const opened = store.handleSessionTransition("active", "completed");

    assert.equal(opened, true);
    assert.equal(usePostRaceStore.getState().isSummaryOpen, true);
    assert.equal(usePostRaceStore.getState().hasAutoOpened, true);
  });

  it("handleSessionTransition does not re-trigger auto-open if already auto-opened for this completed session", () => {
    const store = usePostRaceStore.getState();
    store.handleSessionTransition("active", "completed");

    // Driver dismisses the sheet to inspect the frozen HUD
    store.closeSummary();
    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);

    // Another packet arrives with sessionStatus === "completed"
    const reopened = store.handleSessionTransition("completed", "completed");
    assert.equal(reopened, false);
    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);
  });

  it("resets hasAutoOpened when a new session starts (sessionStatus becomes active)", () => {
    const store = usePostRaceStore.getState();
    store.handleSessionTransition("active", "completed");
    assert.equal(usePostRaceStore.getState().hasAutoOpened, true);

    // SSTA packet arrives -> new session active
    store.handleSessionTransition("completed", "active");
    assert.equal(usePostRaceStore.getState().hasAutoOpened, false);
    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);

    // When the new session eventually completes, auto-open triggers again
    const reopened = store.handleSessionTransition("active", "completed");
    assert.equal(reopened, true);
    assert.equal(usePostRaceStore.getState().isSummaryOpen, true);
  });

  it("attachSessionLifecycleObserver automatically observes raceStore transitions", () => {
    const detach = attachSessionLifecycleObserver(
      useRaceStore,
      usePostRaceStore
    );

    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);

    // Backend sends SEND packet -> sessionStatus: "completed"
    useRaceStore.getState().updateTelemetry({ sessionStatus: "completed" });
    assert.equal(usePostRaceStore.getState().isSummaryOpen, true);
    assert.equal(usePostRaceStore.getState().hasAutoOpened, true);

    // Driver manually dismisses summary
    usePostRaceStore.getState().closeSummary();
    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);

    // Repeated telemetry updates while completed do not re-open modal
    useRaceStore
      .getState()
      .updateTelemetry({ sessionStatus: "completed", timestamp: 12345 });
    assert.equal(usePostRaceStore.getState().isSummaryOpen, false);

    // SSTA starts new session
    useRaceStore.getState().updateTelemetry({ sessionStatus: "active" });
    assert.equal(usePostRaceStore.getState().hasAutoOpened, false);

    detach();
  });
});
