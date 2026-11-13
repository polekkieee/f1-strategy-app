import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../ui/theme";
import {
  TactilePromptButton,
  DualTyreGrid,
  type MockTelemetry,
} from "./PrototypeShared";

interface Props {
  data: MockTelemetry;
  onPrompt: (promptKey: string) => void;
}

export function HudVariantB({ data, onPrompt }: Props) {
  return (
    <View style={s.root}>
      {/* Upper Telemetry Grid (70% height) */}
      <View style={s.topGrid}>
        {/* Card 1: Dual Tyre Matrix */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>TYRE DEGRADATION</Text>
            <Text style={[s.cardSubTag, { color: colors.warn }]}>
              MED (14L)
            </Text>
          </View>
          <DualTyreGrid tyres={data.tyres} />
        </View>

        {/* Card 2: Rejoin & Traffic Window */}
        <View style={[s.card, { flex: 1.2 }]}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>PIT REJOIN & TRAFFIC WINDOW</Text>
            <Text style={s.cardSubTag}>{data.pitLossDuration}s LOSS</Text>
          </View>
          <View style={s.rejoinRow}>
            <View style={s.rejoinBadge}>
              <Text style={s.rejoinBadgeText}>P{data.rejoinPosition}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.statusPill}>
                <Text style={s.statusPillText}>{data.rejoinStatus}</Text>
              </View>
              <Text style={s.subAlertText}>Clean air margin: +4.2s to ALO</Text>
            </View>
          </View>
          <View style={s.gapsRow}>
            <Text style={s.gapText}>{data.gapAheadText}</Text>
            <Text style={s.gapText}>{data.gapBehindText}</Text>
          </View>
        </View>

        {/* Card 3: Weather Crossover */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>WEATHER CROSSOVER</Text>
            <Text style={s.cardSubTag}>{data.rainPercentage}% DAMP</Text>
          </View>
          <View style={s.weatherCenter}>
            <Text style={s.weatherClock}>{data.crossoverTime}</Text>
            <View style={s.targetPill}>
              <Text style={s.targetPillText}>{data.targetCompound}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Lower Command Deck: 4 Massive Buttons */}
      <View style={s.bottomDeck}>
        <TactilePromptButton
          primary="🛑 BOX THIS LAP"
          sub="Confirm Inters"
          urgent
          onPress={() => onPrompt("BOX_THIS_LAP")}
          style={{ flex: 1 }}
        />
        <TactilePromptButton
          primary="🌧️ CROSSOVER"
          sub="Rain Timeline"
          onPress={() => onPrompt("CROSSOVER")}
          style={{ flex: 1 }}
        />
        <TactilePromptButton
          primary="⏱️ REJOIN SLOT"
          sub="Traffic Check"
          onPress={() => onPrompt("REJOIN")}
          style={{ flex: 1 }}
        />
        <TactilePromptButton
          primary="🛞 TYRES / CLIFF"
          sub="Carcass Health"
          onPress={() => onPrompt("TYRE_STATUS")}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  topGrid: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  bottomDeck: {
    height: 64,
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  cardSubTag: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "700",
  },
  rejoinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  rejoinBadge: {
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  rejoinBadgeText: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  statusPill: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: colors.good,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  statusPillText: {
    color: colors.good,
    fontSize: 10,
    fontWeight: "900",
  },
  subAlertText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "600",
    marginTop: 3,
  },
  gapsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 8,
  },
  gapText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  weatherCenter: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  weatherClock: {
    color: colors.accent,
    fontSize: 28,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  targetPill: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: colors.good,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 4,
  },
  targetPillText: {
    color: colors.good,
    fontSize: 10,
    fontWeight: "900",
  },
});
