import { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
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

export function HudCanvas() {
  const windowDims = useWindowDimensions();
  const width = windowDims?.width ?? 844;
  const isTablet = width >= 768;

  return (
    <View style={[s.root, isTablet && s.rootTablet]}>
      <HeaderBar />
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
    </View>
  );
}

export default function App() {
  useTelemetry();
  useTacticalHaptics();
  useSessionLifecycle();
  useKeepAwake();
  useEffect(() => {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }, []);

  return (
    <View style={s.screenContainer}>
      <HudCanvas />
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
  },
  rootTablet: {
    paddingHorizontal: 20,
    paddingTop: 14,
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
