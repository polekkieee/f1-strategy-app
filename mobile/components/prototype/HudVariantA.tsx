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

export function HudVariantA({ data, onPrompt }: Props) {
  return (
    <View style={s.root}>
      {/* Left Thumb Wing (Touch Zone) */}
      <View style={s.wingLeft}>
        <TactilePromptButton
          primary="🛑 BOX THIS LAP"
          sub="Confirm Pit Stop"
          urgent
          onPress={() => onPrompt("BOX_THIS_LAP")}
          style={{ flex: 1.2 }}
        />
        <TactilePromptButton
          primary="🌧️ CROSSOVER?"
          sub={`Rain: ${data.crossoverTime}`}
          onPress={() => onPrompt("CROSSOVER")}
          style={{ flex: 1 }}
        />
        <TactilePromptButton
          primary="⏱️ REJOIN SLOT"
          sub={`Exit P${data.rejoinPosition} [Clean]`}
          onPress={() => onPrompt("REJOIN")}
          style={{ flex: 1 }}
        />
      </View>

      {/* Center Strategic Core */}
      <View style={s.centerSpine}>
        {/* Rejoin Card */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>PIT EXIT REJOIN & TRAFFIC WINDOW</Text>
            <Text style={s.cardSubTag}>
              {data.pitLossDuration}s PIT LOSS [PADDOCK]
            </Text>
          </View>
          <View style={s.rejoinRow}>
            <View style={s.rejoinBadge}>
              <Text style={s.rejoinBadgeText}>P{data.rejoinPosition}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={s.statusPill}>
                <Text style={s.statusPillText}>{data.rejoinStatus}</Text>
              </View>
              <View style={s.gapsRow}>
                <Text style={s.gapText}>{data.gapAheadText}</Text>
                <Text style={s.gapText}>{data.gapBehindText}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weather Crossover Card */}
        <View style={s.card}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>WEATHER CROSSOVER COUNTDOWN</Text>
            <Text style={s.cardSubTag}>
              {data.rainPercentage}% DAMP • RISING
            </Text>
          </View>
          <View style={s.weatherRow}>
            <View>
              <Text style={s.weatherClock}>{data.crossoverTime}</Text>
              <Text style={s.weatherClockSub}>MINUTES TO CROSSOVER</Text>
            </View>
            <View style={s.targetPill}>
              <Text style={s.targetPillText}>
                TARGET: {data.targetCompound}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Right Wing: Dual Tyre Matrix & 4th Prompt */}
      <View style={s.wingRight}>
        <View style={[s.card, { flex: 1 }]}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>DUAL TYRE MATRIX</Text>
            <Text style={[s.cardSubTag, { color: colors.warn }]}>
              MED • 14L
            </Text>
          </View>
          <DualTyreGrid tyres={data.tyres} />
        </View>
        <TactilePromptButton
          primary="🛞 THERMALS & CLIFF"
          sub="Rear Wear 44%"
          onPress={() => onPrompt("TYRE_STATUS")}
          style={{ height: 46 }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 40,
  },
  wingLeft: {
    width: 175,
    gap: 6,
  },
  centerSpine: {
    flex: 1,
    gap: 8,
  },
  wingRight: {
    width: 195,
    gap: 6,
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
    marginTop: 2,
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
    fontSize: 26,
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
  gapsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  gapText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  weatherClock: {
    color: colors.accent,
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  weatherClockSub: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "700",
  },
  targetPill: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: colors.good,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  targetPillText: {
    color: colors.good,
    fontSize: 10,
    fontWeight: "900",
  },
});
