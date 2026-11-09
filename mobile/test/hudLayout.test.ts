import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { colors } from "../ui/theme";

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
        type: element.type,
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

function hasStyleProperty(
  nodes: any[],
  property: string,
  expectedValue: any
): boolean {
  return nodes.some((n) => {
    const styles = Array.isArray(n.style) ? n.style : [n.style];
    return styles.some((s: any) => s && s[property] === expectedValue);
  });
}

function hasTabularNums(nodes: any[]): boolean {
  return nodes.some((n) => {
    const styles = Array.isArray(n.style) ? n.style : [n.style];
    return styles.some(
      (s: any) =>
        s?.fontVariant &&
        Array.isArray(s.fontVariant) &&
        s.fontVariant.includes("tabular-nums")
    );
  });
}

function countTabularNums(nodes: any[]): number {
  return nodes.filter((n) => {
    const styles = Array.isArray(n.style) ? n.style : [n.style];
    return styles.some(
      (s: any) =>
        s?.fontVariant &&
        Array.isArray(s.fontVariant) &&
        s.fontVariant.includes("tabular-nums")
    );
  }).length;
}

describe("HUD Canvas Architecture & Visual Polish (Issue #17)", () => {
  describe("Three-Column Layout Structure", () => {
    it("HudCanvas organizes widgets into the 3-column architecture", async () => {
      const { HudCanvas } = await import("../App");

      const canvas = HudCanvas();
      assert.ok(canvas !== null);

      // Locate the columns container
      const rootChildren = canvas.props.children;
      assert.ok(Array.isArray(rootChildren));
      // First child is HeaderBar, second is columns container
      const colsContainer = rootChildren[1];
      assert.ok(colsContainer, "Cols container must exist");
      const columns = colsContainer.props.children;
      assert.equal(columns.length, 3, "Must have exactly 3 columns");

      const [col1, col2, col3] = columns;

      // Column 1 (Left): PaceWidget, GapsWidget
      const col1Children = col1.props.children;
      assert.equal(col1Children.length, 2, "Column 1 must have 2 widgets");
      assert.equal(col1Children[0].type.name, "PaceWidget");
      assert.equal(col1Children[1].type.name, "GapsWidget");

      // Column 2 (Center): ActionablePenalties, PittingBanner, TyreWidget, FuelGauge
      const col2Children = col2.props.children;
      assert.equal(col2Children.length, 4, "Column 2 must have 4 widgets");
      assert.equal(col2Children[0].type.name, "ActionablePenalties");
      assert.equal(col2Children[1].type.name, "PittingBanner");
      assert.equal(col2Children[2].type.name, "TyreWidget");
      assert.equal(col2Children[3].type.name, "FuelGauge");

      // Column 3 (Right): SafetyCarAlert, StrategyCard
      const col3Children = col3.props.children;
      assert.equal(col3Children.length, 2, "Column 3 must have 2 widgets");
      assert.equal(col3Children[0].type.name, "SafetyCarAlert");
      assert.equal(col3Children[1].type.name, "StrategyCard");
    });

    it("applies responsive padding and gap for tablet vs phone rig mounts", async () => {
      const { HudCanvas } = await import("../App");
      // @ts-expect-error test mock export
      const { __setMockDimensions } = await import("react-native");

      __setMockDimensions({ width: 667, height: 375 });
      const phoneCanvas = HudCanvas();
      const phoneNodes = collectNodes(phoneCanvas);
      assert.ok(
        hasStyleProperty(phoneNodes, "paddingHorizontal", 12),
        "Phone layout should have 12px padding"
      );
      assert.ok(
        hasStyleProperty(phoneNodes, "gap", 8),
        "Phone layout should have 8px gap"
      );

      __setMockDimensions({ width: 1024, height: 768 });
      const tabletCanvas = HudCanvas();
      const tabletNodes = collectNodes(tabletCanvas);
      assert.ok(
        hasStyleProperty(tabletNodes, "paddingHorizontal", 20),
        "Tablet layout should have 20px padding"
      );
      assert.ok(
        hasStyleProperty(tabletNodes, "gap", 12),
        "Tablet layout should have 12px gap"
      );
    });
  });

  describe("Driver Glanceability & Tabular Numerals", () => {
    it("applies tabular-nums to HeaderBar lap counter", async () => {
      const { HeaderBarView } = await import("../components/HeaderBar");
      const node = HeaderBarView({
        isConnected: true,
        trackName: "Spa",
        sessionType: "Race",
        currentLap: 14,
        totalLaps: 44,
        age: 0,
        stale: false,
        onOpenSettings: () => {},
        onOpenSummary: () => {},
      });

      const nodes = collectNodes(node);
      assert.ok(
        hasTabularNums(nodes),
        "HeaderBar lap counter must use fontVariant tabular-nums"
      );
    });

    it("applies tabular-nums across StrategyCard counters and cooldowns", async () => {
      const { StrategyCardView } = await import("../components/StrategyCard");
      const node = StrategyCardView({
        plan: {
          lapToBox: 22,
          newTires: "hard",
          explanation: "Undercut rival",
          confidence: "high",
          generatedAtLap: 18,
          generatedAt: Date.now(),
        },
        status: "idle",
        error: null,
        cooldownUntil: Date.now() + 10000,
        lap: 18,
        gameIdeal: 24,
        connected: true,
        now: Date.now(),
        onGenerate: () => {},
      });
      const nodes = collectNodes(node);
      const tabularCount = countTabularNums(nodes);

      assert.ok(
        tabularCount >= 1,
        "StrategyCard must apply tabular-nums to timing/lap figures"
      );
    });
  });

  describe("Safety Car High-Visibility Accent Borders", () => {
    it("renders high-visibility accent borders with at least 1.5px width during active Safety Car", async () => {
      const { CardView } = await import("../components/Card");

      const activeCard = CardView({
        title: "TEST",
        children: null,
        isSafetyCarActive: true,
      });
      const nodes = collectNodes(activeCard);
      assert.ok(
        hasStyleProperty(nodes, "borderColor", colors.warn),
        "Safety car active card must have warn border color"
      );
      assert.ok(
        nodes.some((n) => {
          const styles = Array.isArray(n.style) ? n.style : [n.style];
          return styles.some(
            (s: any) =>
              s?.borderWidth !== undefined && Number(s.borderWidth) >= 1.5
          );
        }),
        "Safety car active card must have high-visibility border width >= 1.5"
      );
    });
  });
});
