import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import * as ScreenOrientation from "expo-screen-orientation";
import { useTelemetry } from "./hooks/useTelemetry";
import { useTacticalHaptics } from "./hooks/useTacticalHaptics";
import { colors } from "./ui/theme";
import { HeaderBar } from "./components/HeaderBar";
import { SettingsSheet } from "./components/SettingsSheet";
import { TyreWidget } from "./components/TyreWidget";
import { FuelGauge } from "./components/FuelGauge";
import { GapsWidget } from "./components/GapsWidget";
import { PaceWidget } from "./components/PaceWidget";
import { StatusWidget } from "./components/StatusWidget";
import { StrategyCard } from "./components/StrategyCard";
import { PittingBanner } from "./components/PittingBanner";
import { ActionablePenaltyBanner } from "./components/ActionablePenaltyBanner";
import { SafetyCarAlert } from "./components/SafetyCarAlert";

export default function App() {
  useTelemetry();
  useTacticalHaptics();
  useKeepAwake();
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <View style={s.root}>
      <HeaderBar />
      <View style={s.cols}>
        <View style={s.col}>
          <PaceWidget />
          <FuelGauge />
        </View>
        <View style={s.col}>
          <ActionablePenaltyBanner />
          <PittingBanner />
          <TyreWidget />
        </View>
        <View style={s.col}>
          <SafetyCarAlert />
          <StrategyCard />
          <GapsWidget />
          <StatusWidget />
        </View>
      </View>
      <SettingsSheet />
      <StatusBar style="light" hidden />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  cols: { flex: 1, flexDirection: "row", gap: 8 },
  col: { flex: 1 },
});
