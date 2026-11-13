import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "../../ui/theme";

export interface MockTelemetry {
  rejoinPosition: number;
  rejoinStatus: "CLEAN_AIR" | "TRAFFIC_PACK" | "TIGHT_MARGIN";
  pitLossDuration: number;
  gapAheadText: string;
  gapBehindText: string;
  crossoverTime: string;
  targetCompound: "INTERS" | "SLICKS" | "WETS";
  rainPercentage: number;
  tyres: {
    fl: { surf: number; core: number; wear: number };
    fr: { surf: number; core: number; wear: number };
    rl: { surf: number; core: number; wear: number };
    rr: { surf: number; core: number; wear: number };
  };
}

export const DEFAULT_PROTOTYPE_DATA: MockTelemetry = {
  rejoinPosition: 7,
  rejoinStatus: "CLEAN_AIR",
  pitLossDuration: 21.8,
  gapAheadText: "Ahead: +4.2s (ALO • 18L Hard)",
  gapBehindText: "Behind: +3.1s (TSU • 12L Med)",
  crossoverTime: "02:45",
  targetCompound: "INTERS",
  rainPercentage: 18,
  tyres: {
    fl: { surf: 102, core: 94, wear: 28 },
    fr: { surf: 106, core: 97, wear: 31 },
    rl: { surf: 108, core: 101, wear: 42 },
    rr: { surf: 110, core: 103, wear: 44 },
  },
};

export function triggerPromptHaptic() {
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch {
    // Web or non-haptic environment
  }
}

interface PromptBtnProps {
  primary: string;
  sub: string;
  urgent?: boolean;
  onPress: () => void;
  style?: object;
}

export function TactilePromptButton({
  primary,
  sub,
  urgent,
  onPress,
  style,
}: PromptBtnProps) {
  const [active, setActive] = useState(false);

  const handlePress = () => {
    triggerPromptHaptic();
    setActive(true);
    onPress();
    setTimeout(() => setActive(false), 300);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        ps.promptBtn,
        urgent && ps.promptBtnUrgent,
        (active || pressed) && ps.promptBtnActive,
        style,
      ]}
    >
      <Text style={[ps.promptPrimary, urgent && ps.promptPrimaryUrgent]}>
        {primary}
      </Text>
      <Text style={ps.promptSub}>{sub}</Text>
    </Pressable>
  );
}

export function DualTyreGrid({ tyres }: { tyres: MockTelemetry["tyres"] }) {
  const renderCell = (
    label: string,
    cell: { surf: number; core: number; wear: number }
  ) => {
    const wearCol =
      cell.wear >= 60
        ? colors.bad
        : cell.wear >= 40
          ? colors.warn
          : colors.good;
    const coreCol =
      cell.core >= 105
        ? colors.bad
        : cell.core <= 85
          ? colors.accent
          : colors.good;

    return (
      <View style={ps.tyreCell} key={label}>
        <View style={ps.tyreHeader}>
          <Text style={ps.tyrePos}>{label}</Text>
          <Text style={[ps.tyreWear, { color: wearCol }]}>{cell.wear}%</Text>
        </View>
        <View style={ps.tyreTemps}>
          <View style={ps.tempItem}>
            <Text style={ps.tempLbl}>SURF</Text>
            <Text style={ps.tempVal}>{cell.surf}°</Text>
          </View>
          <View style={ps.tempItem}>
            <Text style={ps.tempLbl}>CORE</Text>
            <Text style={[ps.tempVal, { color: coreCol }]}>{cell.core}°</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={ps.tyreGrid}>
      {renderCell("FL", tyres.fl)}
      {renderCell("FR", tyres.fr)}
      {renderCell("RL", tyres.rl)}
      {renderCell("RR", tyres.rr)}
    </View>
  );
}

export const ps = StyleSheet.create({
  promptBtn: {
    backgroundColor: "#162444",
    borderWidth: 1.5,
    borderColor: "#283e70",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  promptBtnUrgent: {
    backgroundColor: "#3b0d0d",
    borderColor: "#ef4444",
  },
  promptBtnActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
  },
  promptPrimary: {
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  promptPrimaryUrgent: {
    color: "#fca5a5",
  },
  promptSub: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    marginTop: 2,
  },
  tyreGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tyreCell: {
    width: "48%",
    backgroundColor: "rgba(11, 19, 38, 0.9)",
    borderWidth: 1.5,
    borderColor: "#233457",
    borderRadius: 6,
    padding: 5,
    justifyContent: "space-between",
  },
  tyreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  tyrePos: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
  },
  tyreWear: {
    fontSize: 13,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  tyreTemps: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  tempItem: {
    alignItems: "center",
  },
  tempLbl: {
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "700",
  },
  tempVal: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
