import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getTyreTempColor,
  getTyreWearColor,
  formatTyreWear,
  TYRE_TEMP_BANDS,
} from "../utils/tyre";
import { colors } from "../ui/theme";

describe("Tyre Thermal Banding & Wear Formatting (Seam 2)", () => {
  it("classifies tyre temperatures into chromatic bands (< 80 sub-cooling, 85-100 nominal, 100-105 blistering, > 105 critical)", () => {
    // Sub-cooling blue: < 80°C
    assert.equal(getTyreTempColor(75), "#38bdf8"); // Sub-cooling blue (colors.accent)
    assert.equal(getTyreTempColor(79.9), "#38bdf8");

    // Nominal green: 85 - 100°C
    assert.equal(getTyreTempColor(85), colors.good);
    assert.equal(getTyreTempColor(92), colors.good);
    assert.equal(getTyreTempColor(100), colors.good);

    // Warm-up transition: between 80°C and 85°C (maps to sub-cooling blue / approaching window)
    assert.equal(getTyreTempColor(80), "#38bdf8");
    assert.equal(getTyreTempColor(84), "#38bdf8");

    // Blistering amber: > 100°C up to 105°C (100.1 to 105)
    assert.equal(getTyreTempColor(100.1), colors.warn);
    assert.equal(getTyreTempColor(103), colors.warn);
    assert.equal(getTyreTempColor(105), colors.warn);

    // Critical red: > 105°C
    assert.equal(getTyreTempColor(105.1), colors.bad);
    assert.equal(getTyreTempColor(115), colors.bad);
  });

  it("formats tyre wear percentage deterministically and determines wear warning colors", () => {
    assert.equal(formatTyreWear(0), "0%");
    assert.equal(formatTyreWear(12.4), "12%");
    assert.equal(formatTyreWear(12.6), "13%");
    assert.equal(formatTyreWear(100), "100%");

    // Wear colors: < 50% good, 50-70% warn, >= 70% bad
    assert.equal(getTyreWearColor(20), colors.good);
    assert.equal(getTyreWearColor(49.9), colors.good);
    assert.equal(getTyreWearColor(50), colors.warn);
    assert.equal(getTyreWearColor(69.9), colors.warn);
    assert.equal(getTyreWearColor(70), colors.bad);
    assert.equal(getTyreWearColor(85), colors.bad);
  });
});
