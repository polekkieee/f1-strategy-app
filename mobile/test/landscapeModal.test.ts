import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LandscapeModal,
  LANDSCAPE_MODAL_ORIENTATIONS,
} from "../components/LandscapeModal";
import { SettingsSheetView } from "../components/SettingsSheet";
import { PostRaceSummaryView } from "../components/PostRaceSummarySheet";

describe("LandscapeModal & Orientation Safety Guardrail (ADR-0004)", () => {
  it("exports the canonical landscape orientations tuple", () => {
    assert.deepEqual(LANDSCAPE_MODAL_ORIENTATIONS, [
      "landscape",
      "landscape-left",
      "landscape-right",
    ]);
  });

  it("LandscapeModal renders Modal with landscape orientations and transparent=true by default", () => {
    const node = LandscapeModal({
      visible: true,
      children: null,
    }) as any;

    assert.equal(node.type.name ?? node.type, "Modal");
    assert.equal(node.props.visible, true);
    assert.equal(node.props.transparent, true);
    assert.deepEqual(
      node.props.supportedOrientations,
      LANDSCAPE_MODAL_ORIENTATIONS
    );
  });

  it("SettingsSheetView enforces landscape orientations on its modal sheet", () => {
    const node = SettingsSheetView({
      isOpen: true,
      activeHost: "192.168.1.50:5000",
      draftHost: "192.168.1.50:5000",
      testState: { kind: "idle" },
      showActualTyreCompound: false,
      enableHapticAlerts: true,
      onDraftHostChange: () => {},
      onTestConnection: () => {},
      onSave: () => {},
      onToggleActualTyre: () => {},
      onToggleHaptics: () => {},
      onClose: () => {},
    }) as any;

    assert.equal(node.props.visible, true);
    assert.equal(node.props.animationType, "slide");
    assert.deepEqual(
      node.props.supportedOrientations,
      LANDSCAPE_MODAL_ORIENTATIONS
    );
    assert.ok(
      node.props.supportedOrientations.includes("landscape"),
      "SettingsSheetView must explicitly support landscape to prevent iOS crash"
    );
  });

  it("PostRaceSummaryView enforces landscape orientations on its modal sheet", () => {
    const node = PostRaceSummaryView({
      isOpen: true,
      position: 1,
      currentLap: 50,
      totalLaps: 50,
      totalPenaltySeconds: 0,
      tireWearLF: 10,
      tireWearRF: 10,
      tireWearLR: 10,
      tireWearRR: 10,
      onClose: () => {},
    }) as any;

    assert.equal(node.props.visible, true);
    assert.deepEqual(
      node.props.supportedOrientations,
      LANDSCAPE_MODAL_ORIENTATIONS
    );
    assert.ok(
      node.props.supportedOrientations.includes("landscape"),
      "PostRaceSummaryView must explicitly support landscape to prevent iOS crash"
    );
  });
});
