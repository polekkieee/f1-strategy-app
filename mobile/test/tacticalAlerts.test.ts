import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getActionablePenalties,
  isPitting,
  isSafetyCarActive,
  getSafetyCarType,
  isBoxThisLap,
} from "../utils/tacticalAlerts";

describe("Tactical Alerts Evaluators (Seam 2)", () => {
  describe("getActionablePenalties", () => {
    it("extracts unserved actionable penalties (Drive through, Stop and go) and ignores time penalties", () => {
      const penalties = [
        "3 sec time penalty",
        "Drive through",
        "5 sec",
        "Stop and go",
      ];
      assert.deepEqual(getActionablePenalties(penalties), [
        "Drive through",
        "Stop and go",
      ]);
    });

    it("matches actionable penalties case-insensitively and handles empty/null inputs", () => {
      assert.deepEqual(
        getActionablePenalties(["DRIVE THROUGH", "stop and go"]),
        ["DRIVE THROUGH", "stop and go"]
      );
      assert.deepEqual(getActionablePenalties([]), []);
      assert.deepEqual(getActionablePenalties(undefined), []);
      assert.deepEqual(getActionablePenalties(null), []);
      assert.deepEqual(getActionablePenalties(["5 sec penalty", "10s"]), []);
    });

    it("preserves multiple actionable penalties of the same type", () => {
      assert.deepEqual(
        getActionablePenalties(["Drive through", "Drive through"]),
        ["Drive through", "Drive through"]
      );
    });
  });

  describe("isPitting", () => {
    it("returns true only when pitStatus is pitting (case-insensitive)", () => {
      assert.equal(isPitting("pitting"), true);
      assert.equal(isPitting("PITTING"), true);
      assert.equal(isPitting("Pitting"), true);
      assert.equal(isPitting("in pit lane"), false);
      assert.equal(isPitting("none"), false);
      assert.equal(isPitting(""), false);
      assert.equal(isPitting(undefined), false);
      assert.equal(isPitting(null), false);
    });
  });

  describe("isSafetyCarActive & getSafetyCarType", () => {
    it("identifies active Full Safety Car and Virtual Safety Car phases", () => {
      assert.equal(isSafetyCarActive("Full Safety Car"), true);
      assert.equal(isSafetyCarActive("Virtual Safety Car"), true);
      assert.equal(isSafetyCarActive("SC"), true);
      assert.equal(isSafetyCarActive("VSC"), true);
      assert.equal(isSafetyCarActive("full safety car"), true);
      assert.equal(isSafetyCarActive("virtual safety car"), true);

      assert.equal(getSafetyCarType("Full Safety Car"), "SC");
      assert.equal(getSafetyCarType("SC"), "SC");
      assert.equal(getSafetyCarType("Virtual Safety Car"), "VSC");
      assert.equal(getSafetyCarType("VSC"), "VSC");
    });

    it("returns false / null for inactive, formation lap, or invalid statuses", () => {
      assert.equal(isSafetyCarActive("No Safety Car"), false);
      assert.equal(isSafetyCarActive("Formation Lap Safety Car"), false);
      assert.equal(isSafetyCarActive(""), false);
      assert.equal(isSafetyCarActive(undefined), false);
      assert.equal(isSafetyCarActive(null), false);

      assert.equal(getSafetyCarType("No Safety Car"), null);
      assert.equal(getSafetyCarType("Formation Lap Safety Car"), null);
      assert.equal(getSafetyCarType(""), null);
      assert.equal(getSafetyCarType(undefined), null);
      assert.equal(getSafetyCarType(null), null);
    });
  });

  describe("isBoxThisLap", () => {
    it("returns true when lapToBox matches currentLap and is greater than 0", () => {
      assert.equal(isBoxThisLap(14, 14), true);
      assert.equal(isBoxThisLap(1, 1), true);
    });

    it("returns false when not boxing this lap or when no stops planned", () => {
      assert.equal(isBoxThisLap(15, 14), false);
      assert.equal(isBoxThisLap(13, 14), false);
      assert.equal(isBoxThisLap(0, 14), false);
      assert.equal(isBoxThisLap(undefined, 14), false);
      assert.equal(isBoxThisLap(14, undefined), false);
    });
  });
});
