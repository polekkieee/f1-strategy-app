import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { useRaceStore } from "../store/useRaceStore";
import { usePostRaceStore } from "../store/usePostRaceStore";
import { attachSessionLifecycleObserver } from "../hooks/useSessionLifecycle";

function collectNodes(element: any, acc: any[] = []): any[] {
  if (!element) return acc;
  if (typeof element === "string" || typeof element === "number") {
    acc.push({ text: String(element) });
    return acc;
  }
  if (element.props) {
    if (element.props.style) {
      acc.push({
        style: element.props.style,
        children: element.props.children,
      });
    }
    if (element.props.children) {
      if (Array.isArray(element.props.children)) {
        element.props.children.forEach((c: any) => collectNodes(c, acc));
      } else {
        collectNodes(element.props.children, acc);
      }
    }
  }
  return acc;
}

function findTexts(element: any): string[] {
  const nodes = collectNodes(element);
  return nodes
    .filter((n) => typeof n.text === "string")
    .map((n) => n.text.trim())
    .filter(Boolean);
}

function findPressables(element: any, acc: any[] = []): any[] {
  if (!element) return acc;
  if (element.props?.onPress) {
    acc.push(element);
  }
  if (element.props?.children) {
    if (Array.isArray(element.props.children)) {
      element.props.children.forEach((c: any) => findPressables(c, acc));
    } else {
      findPressables(element.props.children, acc);
    }
  }
  return acc;
}

describe("HeaderBar Post-Race Summary Action Button & Full Lifecycle (Seam 3)", () => {
  beforeEach(() => {
    usePostRaceStore.getState().reset();
    useRaceStore.setState({
      isConnected: true,
      lastUpdateMs: Date.now(),
      trackName: "Silverstone",
      sessionType: "Race",
      sessionStatus: "active",
      playerPosition: 2,
      currentLap: 52,
      totalLaps: 52,
      totalPenaltySeconds: 5,
      tireWearLF: 30,
      tireWearRF: 35,
      tireWearLR: 45,
      tireWearRR: 40,
    });
  });

  describe("HeaderBarView", () => {
    it("does not render POST-RACE SUMMARY button when sessionStatus is active", async () => {
      const { HeaderBarView } = await import("../components/HeaderBar");

      const node = HeaderBarView({
        isConnected: true,
        trackName: "Silverstone",
        sessionType: "Race",
        currentLap: 25,
        totalLaps: 52,
        sessionStatus: "active",
        age: 0,
        stale: false,
        onOpenSettings: () => {},
        onOpenSummary: () => {},
      });

      const texts = findTexts(node).map((t) => t.toUpperCase());
      assert.ok(
        !texts.some((t) => t.includes("POST-RACE SUMMARY")),
        "Must not show POST-RACE SUMMARY button during active session"
      );
    });

    it("renders POST-RACE SUMMARY action button when sessionStatus is completed", async () => {
      const { HeaderBarView } = await import("../components/HeaderBar");

      let summaryOpened = false;
      const node = HeaderBarView({
        isConnected: true,
        trackName: "Silverstone",
        sessionType: "Race",
        currentLap: 52,
        totalLaps: 52,
        sessionStatus: "completed",
        age: 0,
        stale: false,
        onOpenSettings: () => {},
        onOpenSummary: () => {
          summaryOpened = true;
        },
      });

      const texts = findTexts(node).map((t) => t.toUpperCase());
      assert.ok(
        texts.some((t) => t.includes("POST-RACE SUMMARY")),
        "Must display POST-RACE SUMMARY button when sessionStatus === 'completed'"
      );

      const pressables = findPressables(node);
      const summaryBtn = pressables.find((p) => {
        const btnTexts = findTexts(p).map((t) => t.toUpperCase());
        return btnTexts.some((t) => t.includes("POST-RACE SUMMARY"));
      });

      assert.ok(summaryBtn, "POST-RACE SUMMARY button must be interactive");
      summaryBtn.props.onPress();
      assert.equal(
        summaryOpened,
        true,
        "Pressing POST-RACE SUMMARY must trigger onOpenSummary"
      );
    });
  });

  describe("Session Completion Lifecycle & Re-opening Flow", () => {
    it("auto-opens on completion, allows manual dismissal to inspect HUD, and re-opens via action button", async () => {
      const detach = attachSessionLifecycleObserver(
        useRaceStore,
        usePostRaceStore
      );
      const { HeaderBarView } = await import("../components/HeaderBar");

      // 1. Initial active state: modal is closed, header has no summary button
      assert.equal(usePostRaceStore.getState().isSummaryOpen, false);
      let headerNode = HeaderBarView({
        isConnected: true,
        trackName: "Silverstone",
        sessionType: "Race",
        currentLap: 51,
        totalLaps: 52,
        sessionStatus: useRaceStore.getState().sessionStatus,
        age: 0,
        stale: false,
        onOpenSettings: () => {},
        onOpenSummary: usePostRaceStore.getState().openSummary,
      });
      assert.ok(
        !findTexts(headerNode).some((t) =>
          t.toUpperCase().includes("POST-RACE SUMMARY")
        )
      );

      // 2. Session completes (SEND packet): observer automatically opens Post-Race Summary
      useRaceStore.getState().updateTelemetry({ sessionStatus: "completed" });
      assert.equal(
        usePostRaceStore.getState().isSummaryOpen,
        true,
        "Observer must automatically open Post-Race Summary on session completion"
      );

      // 3. Driver dismisses summary to inspect frozen HUD canvas
      usePostRaceStore.getState().closeSummary();
      assert.equal(
        usePostRaceStore.getState().isSummaryOpen,
        false,
        "Dismiss button must close modal sheet"
      );

      // 4. Repeated telemetry packets while session is completed do NOT re-open modal
      useRaceStore
        .getState()
        .updateTelemetry({ sessionStatus: "completed", timestamp: 99999 });
      assert.equal(
        usePostRaceStore.getState().isSummaryOpen,
        false,
        "Repeated updates must not re-open dismissed sheet"
      );

      // 5. HeaderBar now displays POST-RACE SUMMARY action button
      headerNode = HeaderBarView({
        isConnected: true,
        trackName: "Silverstone",
        sessionType: "Race",
        currentLap: 52,
        totalLaps: 52,
        sessionStatus: useRaceStore.getState().sessionStatus,
        age: 0,
        stale: false,
        onOpenSettings: () => {},
        onOpenSummary: usePostRaceStore.getState().openSummary,
      });
      const summaryBtn = findPressables(headerNode).find((p) =>
        findTexts(p).some((t) => t.toUpperCase().includes("POST-RACE SUMMARY"))
      );
      assert.ok(
        summaryBtn,
        "Header must offer POST-RACE SUMMARY button when sessionStatus === 'completed'"
      );

      // 6. Driver clicks POST-RACE SUMMARY button to re-open summary sheet
      summaryBtn.props.onPress();
      assert.equal(
        usePostRaceStore.getState().isSummaryOpen,
        true,
        "Clicking header action button must re-open summary sheet"
      );

      // 7. SSTA packet arrives -> new session resets lifecycle
      useRaceStore.getState().updateTelemetry({ sessionStatus: "active" });
      assert.equal(usePostRaceStore.getState().isSummaryOpen, false);
      assert.equal(usePostRaceStore.getState().hasAutoOpened, false);

      detach();
    });
  });
});
