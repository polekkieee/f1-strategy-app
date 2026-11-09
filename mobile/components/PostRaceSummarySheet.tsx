import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useRaceStore } from "../store/useRaceStore";
import { usePostRaceStore } from "../store/usePostRaceStore";
import { colors } from "../ui/theme";

const getWearColor = (wearPercentage: number) =>
  wearPercentage >= 70
    ? colors.bad
    : wearPercentage >= 50
      ? colors.warn
      : colors.good;

export interface PostRaceSummaryViewProps {
  isOpen: boolean;
  position: number;
  currentLap: number;
  totalLaps: number;
  totalPenaltySeconds: number;
  tireWearLF: number;
  tireWearRF: number;
  tireWearLR: number;
  tireWearRR: number;
  penalties?: string[];
  trackName?: string;
  sessionType?: string;
  onClose: () => void;
}

function renderTyreCorner(label: string, wear: number) {
  const color = getWearColor(wear);
  return (
    <View key={label} style={[s.tyreCorner, { borderColor: color }]}>
      <Text style={s.tyreCornerLabel}>{label}</Text>
      <Text style={[s.tyreCornerVal, { color }]}>{`${wear.toFixed(0)}%`}</Text>
    </View>
  );
}

export function PostRaceSummaryView({
  isOpen,
  position,
  currentLap,
  totalLaps,
  totalPenaltySeconds,
  tireWearLF,
  tireWearRF,
  tireWearLR,
  tireWearRR,
  penalties = [],
  trackName,
  sessionType,
  onClose,
}: PostRaceSummaryViewProps) {
  const posDisplay = position > 0 ? `P${position}` : "—";
  const lapDisplay =
    totalLaps > 0 ? `${currentLap}/${totalLaps}` : `${currentLap}`;
  const penaltyDisplay = `${totalPenaltySeconds}s`;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <Pressable style={s.dismissArea} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <View>
              <Text style={s.title}>POST-RACE SUMMARY</Text>
              {(trackName || sessionType) && (
                <Text style={s.subtitle}>
                  {trackName || "—"} · {sessionType || "Race"}
                </Text>
              )}
            </View>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>DISMISS</Text>
            </Pressable>
          </View>

          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            {/* Classification & Finish Position */}
            <View style={s.heroCard}>
              <Text style={s.heroLabel}>FINAL CLASSIFICATION</Text>
              <Text style={s.heroPosition}>{posDisplay}</Text>
            </View>

            {/* Key Session Metrics */}
            <View style={s.metricsRow}>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>TOTAL LAPS</Text>
                <Text style={s.metricValue}>{lapDisplay}</Text>
              </View>
              <View style={s.metricBox}>
                <Text style={s.metricLabel}>TOTAL PENALTY</Text>
                <Text
                  style={[
                    s.metricValue,
                    totalPenaltySeconds > 0 && { color: colors.bad },
                  ]}
                >
                  {penaltyDisplay}
                </Text>
              </View>
            </View>

            {/* Penalty summary */}
            <View
              style={[
                s.penaltyBox,
                penalties.length === 0 && s.penaltyBoxClean,
              ]}
            >
              <Text style={s.sectionHeader}>PENALTY SUMMARY</Text>
              {penalties.length > 0 ? (
                penalties.map((p, idx) => (
                  <Text key={idx} style={s.penaltyItem}>
                    • {p}
                  </Text>
                ))
              ) : (
                <Text style={s.penaltyCleanText}>CLEAN · NO PENALTIES</Text>
              )}
            </View>

            {/* Final Tyre Degradation */}
            <View style={s.tyresSection}>
              <Text style={s.sectionHeader}>FINAL TYRE DEGRADATION</Text>
              <View style={s.tyresGrid}>
                {renderTyreCorner("FL", tireWearLF)}
                {renderTyreCorner("FR", tireWearRF)}
                {renderTyreCorner("RL", tireWearLR)}
                {renderTyreCorner("RR", tireWearRR)}
              </View>
            </View>
          </ScrollView>

          <View style={s.footer}>
            <Pressable onPress={onClose} style={s.dismissBtn}>
              <Text style={s.dismissBtnText}>RETURN TO HUD</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function PostRaceSummarySheet() {
  const isOpen = usePostRaceStore((s) => s.isSummaryOpen);
  const closeSummary = usePostRaceStore((s) => s.closeSummary);

  const race = useRaceStore(
    useShallow((s) => ({
      position: s.playerPosition,
      currentLap: s.currentLap,
      totalLaps: s.totalLaps,
      totalPenaltySeconds: s.totalPenaltySeconds,
      tireWearLF: s.tireWearLF,
      tireWearRF: s.tireWearRF,
      tireWearLR: s.tireWearLR,
      tireWearRR: s.tireWearRR,
      penalties: s.playerPenalties,
      trackName: s.trackName,
      sessionType: s.sessionType,
    }))
  );

  return (
    <PostRaceSummaryView
      isOpen={isOpen}
      position={race.position}
      currentLap={race.currentLap}
      totalLaps={race.totalLaps}
      totalPenaltySeconds={race.totalPenaltySeconds}
      tireWearLF={race.tireWearLF}
      tireWearRF={race.tireWearRF}
      tireWearLR={race.tireWearLR}
      tireWearRR={race.tireWearRR}
      penalties={race.penalties}
      trackName={race.trackName}
      sessionType={race.sessionType}
      onClose={closeSummary}
    />
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(11, 17, 32, 0.78)",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    width: 440,
    maxWidth: "88%",
    height: "100%",
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderColor: colors.border,
    padding: 16,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  content: {
    flex: 1,
    marginVertical: 4,
  },
  heroCard: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  heroLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heroPosition: {
    color: colors.accent,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },
  metricsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metricValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  penaltyBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: colors.bad,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  penaltyBoxClean: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: colors.good,
  },
  penaltyItem: {
    color: colors.bad,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  penaltyCleanText: {
    color: colors.good,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  tyresSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },
  tyresGrid: {
    flexDirection: "row",
    gap: 6,
  },
  tyreCorner: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  tyreCornerLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
  },
  tyreCornerVal: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  dismissBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  dismissBtnText: {
    color: colors.bg,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
});
