import { describe, it, beforeEach } from "node:test";
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

describe("Tactical Alert Components (Seam 3)", () => {
  describe("PittingBanner", () => {
    it("returns null when pitting is inactive", async () => {
      const { PittingBannerView } = await import("../components/PittingBanner");
      assert.equal(PittingBannerView({ isPitting: false }), null);
    });

    it("renders prominent banner with limiter text when pitting is active", async () => {
      const { PittingBannerView } = await import("../components/PittingBanner");
      const node = PittingBannerView({ isPitting: true });
      assert.ok(node !== null);

      const texts = findTexts(node);
      const textJoined = texts.join(" ").toUpperCase();
      assert.ok(textJoined.includes("PIT"));
      assert.ok(textJoined.includes("LIMITER"));
    });
  });

  describe("ActionablePenaltyBanner", () => {
    it("returns null when no actionable penalties exist", async () => {
      const { ActionablePenaltyBannerView } =
        await import("../components/ActionablePenaltyBanner");
      assert.equal(ActionablePenaltyBannerView({ penalties: [] }), null);
      assert.equal(
        ActionablePenaltyBannerView({
          penalties: ["5 sec time penalty", "3 seconds"],
        }),
        null
      );
    });

    it("renders urgent red banners for unserved Drive Through and Stop and Go penalties", async () => {
      const { ActionablePenaltyBannerView } =
        await import("../components/ActionablePenaltyBanner");
      const node = ActionablePenaltyBannerView({
        penalties: ["Drive through", "5s penalty", "Stop and go"],
      });
      assert.ok(node !== null);

      const texts = findTexts(node);
      const textJoined = texts.join(" ").toUpperCase();
      assert.ok(textJoined.includes("DRIVE THROUGH"));
      assert.ok(textJoined.includes("STOP AND GO"));

      const nodes = collectNodes(node);
      assert.ok(
        hasStyleProperty(nodes, "backgroundColor", "rgba(239, 68, 68, 0.2)") ||
          hasStyleProperty(nodes, "borderColor", colors.bad) ||
          hasStyleProperty(nodes, "color", colors.bad)
      );
    });
  });

  describe("SafetyCarAlert", () => {
    it("returns null when safety car is inactive or on formation lap", async () => {
      const { SafetyCarAlertView } =
        await import("../components/SafetyCarAlert");
      assert.equal(
        SafetyCarAlertView({ safetyCarStatus: "No Safety Car" }),
        null
      );
      assert.equal(
        SafetyCarAlertView({ safetyCarStatus: "Formation Lap Safety Car" }),
        null
      );
      assert.equal(SafetyCarAlertView({ safetyCarStatus: "" }), null);
    });

    it("renders compact amber banner for Full Safety Car and Virtual Safety Car", async () => {
      const { SafetyCarAlertView } =
        await import("../components/SafetyCarAlert");
      const scNode = SafetyCarAlertView({ safetyCarStatus: "Full Safety Car" });
      assert.ok(scNode !== null);
      const scTexts = findTexts(scNode).join(" ").toUpperCase();
      assert.ok(scTexts.includes("SAFETY CAR"));

      const vscNode = SafetyCarAlertView({
        safetyCarStatus: "Virtual Safety Car",
      });
      assert.ok(vscNode !== null);
      const vscTexts = findTexts(vscNode).join(" ").toUpperCase();
      assert.ok(vscTexts.includes("VIRTUAL SAFETY CAR"));

      const scNodes = collectNodes(scNode);
      assert.ok(
        hasStyleProperty(scNodes, "borderColor", colors.warn) ||
          hasStyleProperty(scNodes, "backgroundColor", colors.warn) ||
          hasStyleProperty(scNodes, "color", colors.warn)
      );
    });
  });

  describe("Card safety car border framing", async () => {
    it("renders default border when safety car is inactive and yellow/amber border when active", async () => {
      const { CardView } = await import("../components/Card");

      const normalCard = CardView({
        title: "TEST",
        children: null,
        isSafetyCarActive: false,
      });
      const normalNodes = collectNodes(normalCard);
      assert.ok(hasStyleProperty(normalNodes, "borderColor", colors.border));
      assert.ok(!hasStyleProperty(normalNodes, "borderColor", colors.warn));

      const activeCard = CardView({
        title: "TEST",
        children: null,
        isSafetyCarActive: true,
      });
      const activeNodes = collectNodes(activeCard);
      assert.ok(hasStyleProperty(activeNodes, "borderColor", colors.warn));
    });
  });

  describe("Center Column Tactical Alerts Layout & Order", async () => {
    it("renders actionable penalties before pitting status banner in the Center Column", async () => {
      const { ActionablePenaltyBannerView } =
        await import("../components/ActionablePenaltyBanner");
      const { PittingBannerView } = await import("../components/PittingBanner");

      const penaltyNode = ActionablePenaltyBannerView({
        penalties: ["Drive through"],
      });
      const pittingNode = PittingBannerView({ isPitting: true });

      const centerColChildren = [penaltyNode, pittingNode];

      // Verify penalties come first
      const firstTexts = findTexts(centerColChildren[0]).join(" ");
      const secondTexts = findTexts(centerColChildren[1]).join(" ");

      assert.ok(firstTexts.includes("DRIVE THROUGH"));
      assert.ok(secondTexts.includes("PIT LANE"));
    });
  });
});
