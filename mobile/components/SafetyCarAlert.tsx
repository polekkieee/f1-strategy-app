import { View, Text, StyleSheet } from "react-native";
import { colors } from "../ui/theme";
import { useRaceStore } from "../store/useRaceStore";
import { getSafetyCarType } from "../utils/tacticalAlerts";

export function SafetyCarAlertView({
  safetyCarStatus,
}: {
  safetyCarStatus: string | null | undefined;
}) {
  const scType = getSafetyCarType(safetyCarStatus);
  if (!scType) return null;

  const isVsc = scType === "VSC";
  const label = isVsc ? "VIRTUAL SAFETY CAR" : "SAFETY CAR";
  const subtext = isVsc
    ? "DELTA POSITIVE REQUIRED"
    : "PACK FORMING · NO OVERTAKING";

  return (
    <View style={s.banner}>
      <View style={s.pill}>
        <Text style={s.pillText}>{scType}</Text>
      </View>
      <View style={s.content}>
        <Text style={s.title}>{label}</Text>
        <Text style={s.sub}>{subtext}</Text>
      </View>
    </View>
  );
}

export function SafetyCarAlert() {
  const safetyCarStatus = useRaceStore((s) => s.safetyCarStatus);
  return <SafetyCarAlertView safetyCarStatus={safetyCarStatus} />;
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(245, 158, 11, 0.18)",
    borderWidth: 1.5,
    borderColor: colors.warn,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pill: {
    backgroundColor: colors.warn,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillText: {
    color: colors.bg,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.warn,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1.1,
  },
  sub: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
