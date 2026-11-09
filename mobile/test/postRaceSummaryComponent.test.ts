import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { colors } from "../ui/theme";

function collectNodes(element: any, acc: any[] = []): any[] {
  if (!element) return acc;
  if (typeof element === "string" || typeof element === "number") {
    acc.push({ text: String(element) });
    return acc;
  }
  if (
    typeof element.type === "function" &&
    element.type.name !== "Pressable" &&
    element.type.name !== "Modal" &&
    element.type.name !== "View" &&
    element.type.name !== "Text"
  ) {
    try {
      const rendered = element.type(element.props);
      return collectNodes(rendered, acc);
    } catch {}
  }
  if (element.props) {
    if (element.props.onPress) {
      acc.push({
        onPress: element.props.onPress,
        props: element.props,
        children: element.props.children,
      });
    }
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
  if (
    typeof element.type === "function" &&
    element.type.name !== "Pressable" &&
    element.type.name !== "Modal" &&
    element.type.name !== "View" &&
    element.type.name !== "Text"
  ) {
    try {
      const rendered = element.type(element.props);
      return findPressables(rendered, acc);
    } catch {}
  }
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

describe("Post-Race Summary Sheet Component (Seam 2)", () => {
  it("renders modal with visible=false when isOpen is false", async () => {
    const { PostRaceSummaryView } =
      await import("../components/PostRaceSummarySheet");

    const node = PostRaceSummaryView({
      isOpen: false,
      position: 2,
      currentLap: 57,
      totalLaps: 57,
      totalPenaltySeconds: 5,
      tireWearLF: 35.4,
      tireWearRF: 42.1,
      tireWearLR: 51.0,
      tireWearRR: 49.2,
      onClose: () => {},
    });

    assert.equal(node.props.visible, false);
  });

  it("renders modal with visible=true and displays finishing position P#", async () => {
    const { PostRaceSummaryView } =
      await import("../components/PostRaceSummarySheet");

    const node = PostRaceSummaryView({
      isOpen: true,
      position: 1,
      currentLap: 57,
      totalLaps: 57,
      totalPenaltySeconds: 0,
      tireWearLF: 25,
      tireWearRF: 30,
      tireWearLR: 35,
      tireWearRR: 32,
      onClose: () => {},
    });

    assert.equal(node.props.visible, true);
    assert.deepEqual(node.props.supportedOrientations, [
      "landscape",
      "landscape-left",
      "landscape-right",
    ]);

    const texts = findTexts(node);
    assert.ok(
      texts.some((t) => t === "P1" || t.includes("P1")),
      `Must display finishing position P1, found texts: ${texts.join(", ")}`
    );
  });

  it("displays total laps completed, total penalty seconds, and 4-corner tyre wear percentages", async () => {
    const { PostRaceSummaryView } =
      await import("../components/PostRaceSummarySheet");

    const node = PostRaceSummaryView({
      isOpen: true,
      position: 3,
      currentLap: 53,
      totalLaps: 53,
      totalPenaltySeconds: 10,
      tireWearLF: 41,
      tireWearRF: 45,
      tireWearLR: 62,
      tireWearRR: 58,
      penalties: ["5 sec time penalty", "5 sec time penalty"],
      onClose: () => {},
    });

    const texts = findTexts(node);
    const joined = texts.join(" ");

    // Position
    assert.ok(
      texts.some((t) => t.includes("P3")),
      "Must show P3"
    );

    // Laps completed
    assert.ok(
      texts.some((t) => t === "53" || t === "53/53" || t.includes("53")),
      "Must show 53 laps completed"
    );

    // Total penalty seconds
    assert.ok(
      texts.some(
        (t) => t === "10s" || t.includes("10s") || t.includes("10 SEC")
      ),
      "Must show 10s penalty"
    );

    // 4-corner tyre wear
    assert.ok(
      texts.some((t) => t.includes("41%")),
      "Must show LF 41%"
    );
    assert.ok(
      texts.some((t) => t.includes("45%")),
      "Must show FR 45%"
    );
    assert.ok(
      texts.some((t) => t.includes("62%")),
      "Must show LR 62%"
    );
    assert.ok(
      texts.some((t) => t.includes("58%")),
      "Must show RR 58%"
    );
  });

  it("provides a dismiss button that triggers onClose to return to HUD", async () => {
    const { PostRaceSummaryView } =
      await import("../components/PostRaceSummarySheet");

    let dismissed = false;
    const node = PostRaceSummaryView({
      isOpen: true,
      position: 2,
      currentLap: 70,
      totalLaps: 70,
      totalPenaltySeconds: 0,
      tireWearLF: 10,
      tireWearRF: 12,
      tireWearLR: 15,
      tireWearRR: 14,
      onClose: () => {
        dismissed = true;
      },
    });

    const pressables = findPressables(node);
    assert.ok(
      pressables.length > 0,
      "Must have interactive Pressable elements"
    );

    // Find the dismiss button
    const dismissBtn = pressables.find((p) => {
      const texts = findTexts(p).map((t) => t.toUpperCase());
      return texts.some(
        (t) =>
          t.includes("DISMISS") || t.includes("RETURN") || t.includes("CLOSE")
      );
    });

    assert.ok(dismissBtn, "Must have an explicit dismiss button");
    dismissBtn.props.onPress();
    assert.equal(
      dismissed,
      true,
      "Pressing dismiss button must invoke onClose"
    );
  });

  it("displays clean penalty state when penalties array is empty", async () => {
    const { PostRaceSummaryView } =
      await import("../components/PostRaceSummarySheet");

    const node = PostRaceSummaryView({
      isOpen: true,
      position: 1,
      currentLap: 50,
      totalLaps: 50,
      totalPenaltySeconds: 0,
      tireWearLF: 20,
      tireWearRF: 22,
      tireWearLR: 25,
      tireWearRR: 24,
      penalties: [],
      onClose: () => {},
    });

    const texts = findTexts(node).map((t) => t.toUpperCase());
    assert.ok(
      texts.some((t) => t.includes("CLEAN") || t.includes("NO PENALTIES")),
      "Must show clean penalty state"
    );
  });

  it("PostRaceSummaryView reflects store auto-open, manual dismissal, and re-opening", async () => {
    const { PostRaceSummaryView } =
      await import("../components/PostRaceSummarySheet");
    const { useRaceStore } = await import("../store/useRaceStore");
    const { usePostRaceStore } = await import("../store/usePostRaceStore");
    const { attachSessionLifecycleObserver } =
      await import("../hooks/useSessionLifecycle");

    const detach = attachSessionLifecycleObserver(
      useRaceStore,
      usePostRaceStore
    );

    // Initial active session: sheet is closed (visible=false)
    usePostRaceStore.getState().reset();
    useRaceStore.setState({
      sessionStatus: "active",
      playerPosition: 4,
      currentLap: 40,
      totalLaps: 50,
      totalPenaltySeconds: 0,
      tireWearLF: 30,
      tireWearRF: 32,
      tireWearLR: 40,
      tireWearRR: 38,
      playerPenalties: [],
    });

    const renderView = () => {
      const race = useRaceStore.getState();
      const isOpen = usePostRaceStore.getState().isSummaryOpen;
      return PostRaceSummaryView({
        isOpen,
        position: race.playerPosition,
        currentLap: race.currentLap,
        totalLaps: race.totalLaps,
        totalPenaltySeconds: race.totalPenaltySeconds,
        tireWearLF: race.tireWearLF,
        tireWearRF: race.tireWearRF,
        tireWearLR: race.tireWearLR,
        tireWearRR: race.tireWearRR,
        penalties: race.playerPenalties,
        onClose: usePostRaceStore.getState().closeSummary,
      });
    };

    let sheetNode = renderView();
    assert.equal(sheetNode.props.visible, false);

    // Session completes: observer auto-opens sheet
    useRaceStore.getState().updateTelemetry({ sessionStatus: "completed" });
    sheetNode = renderView();
    assert.equal(sheetNode.props.visible, true);
    assert.ok(findTexts(sheetNode).includes("P4"));

    // Manual dismissal via dismiss button
    const dismissBtn = findPressables(sheetNode).find((p) =>
      findTexts(p).some(
        (t) =>
          t.toUpperCase().includes("RETURN") ||
          t.toUpperCase().includes("DISMISS")
      )
    );
    assert.ok(dismissBtn, "Must find dismiss button on open summary sheet");
    dismissBtn.props.onPress();
    sheetNode = renderView();
    assert.equal(sheetNode.props.visible, false);

    // Driver re-opens via header action
    usePostRaceStore.getState().openSummary();
    sheetNode = renderView();
    assert.equal(sheetNode.props.visible, true);

    detach();
  });
});
