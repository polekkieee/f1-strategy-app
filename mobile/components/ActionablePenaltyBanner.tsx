import { View, Text, StyleSheet } from "react-native";
import { colors } from "../ui/theme";
import { useRaceStore } from "../store/useRaceStore";
import { getActionablePenalties } from "../utils/tacticalAlerts";

export function ActionablePenaltyBannerView({
  penalties,
}: {
  penalties: readonly string[] | null | undefined;
}) {
  const actionable = getActionablePenalties(penalties);
  if (actionable.length === 0) return null;

  return (
    <View style={s.container}>
      {actionable.map((penalty, idx) => {
        const isStopAndGo = penalty.toLowerCase().includes("stop");
        const title = isStopAndGo
          ? "STOP AND GO PENALTY · SERVE WITHIN 3 LAPS"
          : "DRIVE THROUGH PENALTY · SERVE WITHIN 3 LAPS";

        return (
          <View key={`${penalty}-${idx}`} style={s.banner}>
            <Text style={s.badge}>⚠️ URGENT</Text>
            <Text style={s.text}>{title}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ActionablePenalties() {
  const penalties = useRaceStore((s) => s.playerPenalties);
  return <ActionablePenaltyBannerView penalties={penalties} />;
}

export const ActionablePenaltyBanner = ActionablePenalties;

export { ActionablePenaltyBannerView as ActionablePenaltiesView };

const s = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  banner: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1.5,
    borderColor: colors.bad,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  badge: {
    color: colors.bad,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  text: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 1.1,
    fontVariant: ["tabular-nums"],
  },
});
