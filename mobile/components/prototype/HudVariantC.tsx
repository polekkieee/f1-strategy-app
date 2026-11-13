import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../ui/theme";
import { triggerPromptHaptic, type MockTelemetry } from "./PrototypeShared";

interface Props {
  data: MockTelemetry;
  onPrompt: (promptKey: string) => void;
}

export function HudVariantC({ data, onPrompt }: Props) {
  const handleTilePress = (key: string) => {
    triggerPromptHaptic();
    onPrompt(key);
  };

  return (
    <View style={s.root}>
      {/* Left Main Hero Zone (65% width) */}
      <View style={s.heroMain}>
        {/* Dynamic Focus Card */}
        <View style={s.heroCard}>
          <View style={s.cardHead}>
            <Text style={s.heroTag}>PRIORITY: PIT STOP TRAFFIC RADAR</Text>
            <Text style={s.cardSubTag}>{data.pitLossDuration}s PIT LOSS</Text>
          </View>
          <View style={s.heroContent}>
            <View>
              <Text style={s.heroLabel}>PROJECTED EXIT SLOT</Text>
              <View style={s.badgeRow}>
                <View style={s.heroBadge}>
                  <Text style={s.heroBadgeText}>P{data.rejoinPosition}</Text>
                </View>
                <View style={s.heroStatusPill}>
                  <Text style={s.heroStatusText}>{data.rejoinStatus}</Text>
                </View>
              </View>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.heroLabel}>CROSSOVER ARRIVAL</Text>
              <Text style={s.heroClock}>{data.crossoverTime}</Text>
            </View>
          </View>
          <View style={s.heroGaps}>
            <Text style={s.heroGapText}>{data.gapAheadText}</Text>
            <Text style={s.heroGapText}>{data.gapBehindText}</Text>
          </View>
        </View>

        {/* Secondary Glanceable Tyre Strip */}
        <View style={s.tyreStripCard}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>PER-WHEEL DUAL TEMPERATURE MONITOR</Text>
            <Text style={s.cardSubTag}>SURF / CORE / WEAR</Text>
          </View>
          <View style={s.tyreRow}>
            {renderMiniTyre("FL", data.tyres.fl)}
            {renderMiniTyre("FR", data.tyres.fr)}
            {renderMiniTyre("RL", data.tyres.rl)}
            {renderMiniTyre("RR", data.tyres.rr)}
          </View>
        </View>
      </View>

      {/* Right Pillar: Hybrid Action Tiles (35% width) */}
      <View style={s.pillar}>
        <Pressable
          style={[s.hybridTile, s.hybridTileUrgent]}
          onPress={() => handleTilePress("BOX_THIS_LAP")}
        >
          <View style={s.tileHead}>
            <Text style={[s.tileTitle, { color: "#fca5a5" }]}>
              🛑 TACTICAL PIT CALL
            </Text>
            <Text style={s.tapSub}>TAP TO BOX</Text>
          </View>
          <View style={s.tileRow}>
            <Text style={s.tileValPrimary}>BOX THIS LAP</Text>
            <Text style={[s.tileBadge, { color: "#fecaca" }]}>READY</Text>
          </View>
        </Pressable>

        <Pressable
          style={s.hybridTile}
          onPress={() => handleTilePress("CROSSOVER")}
        >
          <View style={s.tileHead}>
            <Text style={s.tileTitle}>🌧️ WEATHER RADAR</Text>
            <Text style={s.tapSub}>TAP AUDIO</Text>
          </View>
          <View style={s.tileRow}>
            <Text style={s.tileValPrimary}>Rain: {data.crossoverTime}</Text>
            <Text style={[s.tileBadge, { color: colors.good }]}>
              {data.targetCompound}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={s.hybridTile}
          onPress={() => handleTilePress("REJOIN")}
        >
          <View style={s.tileHead}>
            <Text style={s.tileTitle}>⏱️ REJOIN GAP</Text>
            <Text style={s.tapSub}>TAP TRAFFIC</Text>
          </View>
          <View style={s.tileRow}>
            <Text style={s.tileValPrimary}>Exit P{data.rejoinPosition}</Text>
            <Text style={[s.tileBadge, { color: colors.good }]}>CLEAN AIR</Text>
          </View>
        </Pressable>

        <Pressable
          style={s.hybridTile}
          onPress={() => handleTilePress("TYRE_STATUS")}
        >
          <View style={s.tileHead}>
            <Text style={s.tileTitle}>🛞 CARCASS STATUS</Text>
            <Text style={s.tapSub}>TAP ADVICE</Text>
          </View>
          <View style={s.tileRow}>
            <Text style={s.tileValPrimary}>Core {data.tyres.rr.core}°C</Text>
            <Text style={[s.tileBadge, { color: colors.warn }]}>STABLE</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function renderMiniTyre(
  label: string,
  t: { surf: number; core: number; wear: number }
) {
  const wearCol =
    t.wear >= 60 ? colors.bad : t.wear >= 40 ? colors.warn : colors.good;
  const coreCol =
    t.core >= 105 ? colors.bad : t.core <= 85 ? colors.accent : colors.good;

  return (
    <View style={s.miniCell} key={label}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={s.miniLabel}>{label}</Text>
        <Text style={[s.miniWear, { color: wearCol }]}>{t.wear}%</Text>
      </View>
      <Text style={s.miniTempText}>
        {t.surf}° <Text style={{ color: coreCol }}>({t.core}°)</Text>
      </Text>
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
  heroMain: {
    flex: 1,
    gap: 8,
  },
  pillar: {
    width: 250,
    gap: 6,
  },
  heroCard: {
    flex: 1.3,
    backgroundColor: "#0c162c",
    borderWidth: 2,
    borderColor: "#253965",
    borderRadius: 8,
    padding: 8,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  heroTag: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.5,
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
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  heroLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  heroBadge: {
    backgroundColor: "#1e293b",
    borderWidth: 2,
    borderColor: "#334155",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  heroBadgeText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
  },
  heroStatusPill: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: colors.good,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  heroStatusText: {
    color: colors.good,
    fontSize: 11,
    fontWeight: "900",
  },
  heroClock: {
    color: colors.accent,
    fontSize: 30,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  heroGaps: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  heroGapText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  tyreStripCard: {
    flex: 0.8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 6,
  },
  tyreRow: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
    marginTop: 2,
  },
  miniCell: {
    flex: 1,
    backgroundColor: "rgba(11, 19, 38, 0.9)",
    borderWidth: 1,
    borderColor: "#233457",
    borderRadius: 4,
    padding: 4,
    justifyContent: "space-between",
  },
  miniLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: "800",
  },
  miniWear: {
    fontSize: 11,
    fontWeight: "900",
  },
  miniTempText: {
    color: "#f8fafc",
    fontSize: 10,
    fontWeight: "800",
  },
  hybridTile: {
    flex: 1,
    backgroundColor: "#14203a",
    borderWidth: 1.5,
    borderColor: "#233660",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: "center",
  },
  hybridTileUrgent: {
    backgroundColor: "#3b0d0d",
    borderColor: "#ef4444",
  },
  tileHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tileTitle: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tapSub: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: "700",
  },
  tileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 2,
  },
  tileValPrimary: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  tileBadge: {
    fontSize: 9,
    fontWeight: "800",
  },
});
