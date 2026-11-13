import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { TyreWidgetView } from "../components/TyreWidget";
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

function hasStyleColor(nodes: any[], targetColor: string): boolean {
  return nodes.some((n) => {
    if (!n.style) return false;
    const styles = Array.isArray(n.style) ? n.style : [n.style];
    return styles.some(
      (s: any) =>
        s &&
        (s.color === targetColor ||
          s.borderColor === targetColor ||
          s.backgroundColor === targetColor)
    );
  });
}

function hasStyleProperty(
  nodes: any[],
  property: string,
  predicate: (val: any) => boolean
): boolean {
  return nodes.some((n) => {
    if (!n.style) return false;
    const styles = Array.isArray(n.style) ? n.style : [n.style];
    return styles.some((s: any) => s && predicate(s[property]));
  });
}

describe("TyreWidgetView Component Presentation (Seam 3)", () => {
  it("renders 4-wheel matrix with LF, RF, LR, RR corners, surface & carcass temperatures, and wear percentages", () => {
    const node = TyreWidgetView({
      compound: "Soft",
      actualCompound: "C4",
      tyreAge: 12,
      showActualCompound: true,
      corners: {
        lf: { label: "LF", wear: 15, surfaceTemp: 92, innerTemp: 95 },
        rf: { label: "RF", wear: 18, surfaceTemp: 102, innerTemp: 104 },
        lr: { label: "LR", wear: 24, surfaceTemp: 76, innerTemp: 78 },
        rr: { label: "RR", wear: 72, surfaceTemp: 108, innerTemp: 110 },
      },
    });

    assert.ok(node);
    assert.equal(node.props.title, "TYRES");

    const collected = collectNodes(node);

    // Assert corners are present
    assert.ok(
      collected.find((n) => n.text === "LF"),
      "Should render LF corner label"
    );
    assert.ok(
      collected.find((n) => n.text === "RF"),
      "Should render RF corner label"
    );
    assert.ok(
      collected.find((n) => n.text === "LR"),
      "Should render LR corner label"
    );
    assert.ok(
      collected.find((n) => n.text === "RR"),
      "Should render RR corner label"
    );

    // Assert wear percentages with tabular-nums
    assert.ok(
      collected.find((n) => n.text === "15%"),
      "Should render LF wear 15%"
    );
    assert.ok(
      collected.find((n) => n.text === "18%"),
      "Should render RF wear 18%"
    );
    assert.ok(
      collected.find((n) => n.text === "24%"),
      "Should render LR wear 24%"
    );
    assert.ok(
      collected.find((n) => n.text === "72%"),
      "Should render RR wear 72%"
    );

    // Assert temperatures
    // LF: Nominal green (92°C surf, 95°C carcass)
    assert.ok(
      collected.find((n) => n.text === "92°C"),
      "Should render LF surface temp 92°C"
    );
    assert.ok(
      collected.find((n) => n.text === "95°C"),
      "Should render LF carcass temp 95°C"
    );

    // RF: Blistering amber (102°C surf, 104°C carcass)
    assert.ok(
      collected.find((n) => n.text === "102°C"),
      "Should render RF surface temp 102°C"
    );
    assert.ok(
      collected.find((n) => n.text === "104°C"),
      "Should render RF carcass temp 104°C"
    );

    // LR: Sub-cooling blue (76°C surf, 78°C carcass)
    assert.ok(
      collected.find((n) => n.text === "76°C"),
      "Should render LR surface temp 76°C"
    );
    assert.ok(
      collected.find((n) => n.text === "78°C"),
      "Should render LR carcass temp 78°C"
    );

    // RR: Critical red (108°C surf, 110°C carcass)
    assert.ok(
      collected.find((n) => n.text === "108°C"),
      "Should render RR surface temp 108°C"
    );
    assert.ok(
      collected.find((n) => n.text === "110°C"),
      "Should render RR carcass temp 110°C"
    );

    // Assert chromatic thermal color presence
    assert.ok(
      hasStyleColor(collected, "#38bdf8"),
      "Should contain sub-cooling blue styling"
    );
    assert.ok(
      hasStyleColor(collected, colors.good),
      "Should contain nominal green styling"
    );
    assert.ok(
      hasStyleColor(collected, colors.warn),
      "Should contain blistering amber styling"
    );
    assert.ok(
      hasStyleColor(collected, colors.bad),
      "Should contain critical red styling"
    );

    // Assert glanceable HUD standards: tabular numerals on numeric telemetry
    assert.ok(
      hasStyleProperty(
        collected,
        "fontVariant",
        (v) => Array.isArray(v) && v.includes("tabular-nums")
      ),
      "Must use fontVariant: ['tabular-nums']"
    );
  });
});
