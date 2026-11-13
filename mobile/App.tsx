import { useState, useEffect } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { useTelemetry } from "./hooks/useTelemetry";
import { useTacticalHaptics } from "./hooks/useTacticalHaptics";
import { useSessionLifecycle } from "./hooks/useSessionLifecycle";
import { colors } from "./ui/theme";
import { HeaderBar } from "./components/HeaderBar";
import { SettingsSheet } from "./components/SettingsSheet";
import { PostRaceSummarySheet } from "./components/PostRaceSummarySheet";
import { TyreWidget } from "./components/TyreWidget";
import { FuelGauge } from "./components/FuelGauge";
import { GapsWidget } from "./components/GapsWidget";
import { PaceWidget } from "./components/PaceWidget";
import { StrategyCard } from "./components/StrategyCard";
import { PittingBanner } from "./components/PittingBanner";
import { ActionablePenalties } from "./components/ActionablePenaltyBanner";
import { SafetyCarAlert } from "./components/SafetyCarAlert";
import { HudVariantA } from "./components/prototype/HudVariantA";
import { HudVariantB } from "./components/prototype/HudVariantB";
import { HudVariantC } from "./components/prototype/HudVariantC";
import { DEFAULT_PROTOTYPE_DATA } from "./components/prototype/PrototypeShared";
import { useSettingsStore, type HudLayoutType } from "./store/useSettingsStore";

export interface HudCanvasProps {
  layout?: HudLayoutType;
  onPrompt?: (key: string) => void;
}

export function HudCanvas({
  layout = "classic",
  onPrompt,
}: HudCanvasProps = {}) {
  const windowDims = useWindowDimensions();
  const width = windowDims?.width ?? 844;
  const isTablet = width >= 768;

  return (
    <View style={[s.root, isTablet && s.rootTablet]}>
      <HeaderBar />

      {/* Dynamic Layout according to Settings */}
      {layout === "thumb_wings" ? (
        <View style={s.variantContainer}>
          <HudVariantA
            data={DEFAULT_PROTOTYPE_DATA}
            onPrompt={onPrompt ?? (() => {})}
          />
        </View>
      ) : layout === "command_deck" ? (
        <View style={s.variantContainer}>
          <HudVariantB
            data={DEFAULT_PROTOTYPE_DATA}
            onPrompt={onPrompt ?? (() => {})}
          />
        </View>
      ) : layout === "hybrid_tiles" ? (
        <View style={s.variantContainer}>
          <HudVariantC
            data={DEFAULT_PROTOTYPE_DATA}
            onPrompt={onPrompt ?? (() => {})}
          />
        </View>
      ) : (
        <View style={[s.cols, isTablet && s.colsTablet]}>
          {/* Column 1 (Left): Pace & Gaps */}
          <View style={s.col}>
            <PaceWidget />
            <GapsWidget />
          </View>

          {/* Column 2 (Center): Car Telemetry & Consumables */}
          <View style={s.col}>
            <ActionablePenalties />
            <PittingBanner />
            <TyreWidget />
            <FuelGauge />
          </View>

          {/* Column 3 (Right): AI Race Engineer & Tactical Alerts */}
          <View style={s.col}>
            <SafetyCarAlert />
            <StrategyCard />
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  useTelemetry();
  useTacticalHaptics();
  useSessionLifecycle();
  useKeepAwake();
  const hudLayout = useSettingsStore((s) => s.hudLayout);
  const [radioBanner, setRadioBanner] = useState<string | null>(null);

  const handlePrompt = (promptKey: string) => {
    let msg = "";
    if (promptKey === "BOX_THIS_LAP") {
      msg =
        '📻 "Box, box. Pit confirm received. Inters ready, exit P7 in clean air."';
    } else if (promptKey === "CROSSOVER") {
      msg =
        '📻 "Rain update: 18% track dampness. Intermediate crossover in 2m45s."';
    } else if (promptKey === "REJOIN") {
      msg =
        '📻 "Rejoin status: Pit now exits P7. Clean air window 4.2s ahead of Alonso."';
    } else if (promptKey === "TYRE_STATUS") {
      msg =
        '📻 "Tyres: Rear carcass running 103°C. Thermal degradation is within limits."';
    }
    setRadioBanner(msg);
    setTimeout(() => setRadioBanner(null), 4000);
  };

  useEffect(() => {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }, []);

  return (
    <View style={s.screenContainer}>
      {radioBanner && (
        <View style={s.radioBanner}>
          <Text style={s.radioBannerText}>{radioBanner}</Text>
        </View>
      )}
      <HudCanvas layout={hudLayout} onPrompt={handlePrompt} />
      <SettingsSheet />
      <PostRaceSummarySheet />
      <StatusBar style="light" hidden />
    </View>
  );
}

const s = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingTop: 10,
    position: "relative",
  },
  rootTablet: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  variantContainer: {
    flex: 1,
    marginTop: 6,
  },
  radioBanner: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 900,
    elevation: 8,
  },
  radioBannerText: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  cols: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  colsTablet: {
    gap: 12,
  },
  col: {
    flex: 1,
  },
});
