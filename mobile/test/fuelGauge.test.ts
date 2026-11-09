import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatFuelMargin,
  getFuelThreshold,
  getFuelStatus,
  roundFuelMargin,
  FUEL_STATUS_COLORS,
} from "../utils/fuel";
import { colors } from "../ui/theme";

describe("Fuel Margin Thresholds & Formatting (Seam 1)", () => {
  it("formats positive and negative margins with explicit sign prefix and laps unit", () => {
    assert.equal(formatFuelMargin(1.5), "+1.5 laps");
    assert.equal(formatFuelMargin(-0.4), "-0.4 laps");
    assert.equal(formatFuelMargin(0), "+0.0 laps");
    assert.equal(formatFuelMargin(-0.0), "+0.0 laps");
    assert.equal(formatFuelMargin(-0.03), "+0.0 laps");
  });

  it("classifies margins into deficit (red), caution (amber), and safe (green) thresholds", () => {
    // Red: < 0.0 laps
    const neg = getFuelThreshold(-0.3);
    assert.equal(neg.status, "deficit");
    assert.equal(neg.color, colors.bad);

    // Amber: 0.0 to 0.5 laps inclusive
    const zero = getFuelThreshold(0.0);
    assert.equal(zero.status, "caution");
    assert.equal(zero.color, colors.warn);

    // Rounding alignment: -0.03 rounds to 0.0 laps, so it must evaluate as caution
    const nearZero = getFuelThreshold(-0.03);
    assert.equal(nearZero.status, "caution");
    assert.equal(nearZero.color, colors.warn);

    const caution = getFuelThreshold(0.3);
    assert.equal(caution.status, "caution");
    assert.equal(caution.color, colors.warn);

    const boundaryCaution = getFuelThreshold(0.5);
    assert.equal(boundaryCaution.status, "caution");
    assert.equal(boundaryCaution.color, colors.warn);

    // Green: > 0.5 laps (e.g. 0.6 laps, 2.0 laps)
    const boundarySafe = getFuelThreshold(0.6);
    assert.equal(boundarySafe.status, "safe");
    assert.equal(boundarySafe.color, colors.good);

    const surplus = getFuelThreshold(2.0);
    assert.equal(surplus.status, "safe");
    assert.equal(surplus.color, colors.good);
  });
});

describe("FuelGauge Component & Race Store Integration (Seam 2)", () => {
  function collectNodes(element: any, acc: any[] = []) {
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

  function hasStyleColor(nodes: any[], expectedColor: string): boolean {
    return nodes.some((n) => {
      const styles = Array.isArray(n.style) ? n.style : [n.style];
      return styles.some((s: any) => s?.color === expectedColor);
    });
  }

  it("FuelGauge component renders margin and threshold across store updates", async () => {
    const { FuelGauge, FuelGaugeView } =
      await import("../components/FuelGauge");
    const { useRaceStore } = await import("../store/useRaceStore");

    assert.ok(typeof FuelGauge === "function");
    assert.ok(typeof FuelGaugeView === "function");

    // 1. Negative deficit (< 0.0 laps)
    const negNode = FuelGaugeView({ margin: -0.6 });
    assert.equal(negNode.props.title, "FUEL MARGIN");
    const negCollected = collectNodes(negNode);
    assert.ok(
      negCollected.find((n) => n.text === "-0.6 laps"),
      "Must render formatted deficit text '-0.6 laps'"
    );
    assert.ok(
      negCollected.find((n) => n.text === "DEFICIT"),
      "Must render status badge 'DEFICIT'"
    );
    assert.ok(
      hasStyleColor(negCollected, colors.bad),
      "Must style deficit margin with colors.bad (Red)"
    );

    // 2. Exact zero (0.0 laps -> caution/amber)
    const zeroNode = FuelGaugeView({ margin: 0.0 });
    const zeroCollected = collectNodes(zeroNode);
    assert.ok(
      zeroCollected.find((n) => n.text === "+0.0 laps"),
      "Must render formatted zero text '+0.0 laps'"
    );
    assert.ok(
      zeroCollected.find((n) => n.text === "CAUTION"),
      "Must render status badge 'CAUTION' at 0.0 laps"
    );
    assert.ok(
      hasStyleColor(zeroCollected, colors.warn),
      "Must style zero margin with colors.warn (Amber)"
    );

    // 3. Caution range (0.0 - 0.5 laps, e.g. 0.4 laps)
    const cautionNode = FuelGaugeView({ margin: 0.4 });
    const cautionCollected = collectNodes(cautionNode);
    assert.ok(
      cautionCollected.find((n) => n.text === "+0.4 laps"),
      "Must render '+0.4 laps'"
    );
    assert.ok(
      cautionCollected.find((n) => n.text === "CAUTION"),
      "Must render 'CAUTION' in low margin range"
    );
    assert.ok(
      hasStyleColor(cautionCollected, colors.warn),
      "Must style caution margin with colors.warn (Amber)"
    );

    // 4. Safe surplus range (> 0.5 laps, e.g. 1.8 laps)
    const safeNode = FuelGaugeView({ margin: 1.8 });
    const safeCollected = collectNodes(safeNode);
    assert.ok(
      safeCollected.find((n) => n.text === "+1.8 laps"),
      "Must render '+1.8 laps'"
    );
    assert.ok(
      safeCollected.find((n) => n.text === "SURPLUS"),
      "Must render 'SURPLUS' for safe margin"
    );
    assert.ok(
      hasStyleColor(safeCollected, colors.good),
      "Must style safe margin with colors.good (Green)"
    );

    // 5. Verify tabular-nums fontVariant is applied to prevent layout jitter
    const hasTabularNums = negCollected.some((n) => {
      const styles = Array.isArray(n.style) ? n.style : [n.style];
      return styles.some((s: any) => s?.fontVariant?.includes("tabular-nums"));
    });
    assert.ok(
      hasTabularNums,
      "Must apply fontVariant ['tabular-nums'] to avoid layout jitter"
    );

    // 6. Verify store selector reacts to live fuelRemainingLaps telemetry updates
    let observedFuel: number | null = null;
    const unsub = useRaceStore.subscribe((state) => {
      observedFuel = state.fuelRemainingLaps;
    });

    useRaceStore.getState().updateTelemetry({ fuelRemainingLaps: 1.25 });
    assert.equal(observedFuel, 1.25);

    const liveNode = FuelGaugeView({
      margin: useRaceStore.getState().fuelRemainingLaps,
    });
    const liveCollected = collectNodes(liveNode);
    assert.ok(
      liveCollected.find((n) => n.text === "+1.3 laps"),
      "FuelGaugeView with store state renders formatted live value"
    );

    unsub();
  });
});
