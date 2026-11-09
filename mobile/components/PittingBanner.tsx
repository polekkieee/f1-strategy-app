import { View, Text, StyleSheet } from "react-native";
import { colors } from "../ui/theme";
import { useRaceStore } from "../store/useRaceStore";
import { isPitting } from "../utils/tacticalAlerts";

export function PittingBannerView({
  isPitting: active,
}: {
  isPitting: boolean;
}) {
  if (!active) return null;

  return (
    <View style={s.banner}>
      <View style={s.indicatorDot} />
      <Text style={s.text}>PIT LANE · SPEED LIMITER ACTIVE</Text>
    </View>
  );
}

export function PittingBanner() {
  const pitStatus = useRaceStore((s) => s.pitStatus);
  return <PittingBannerView isPitting={isPitting(pitStatus)} />;
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
    marginRight: 8,
  },
  text: {
    color: colors.accent,
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 1.2,
  },
});
