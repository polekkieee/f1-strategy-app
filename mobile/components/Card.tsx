import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { colors } from "../ui/theme";
import { useRaceStore } from "../store/useRaceStore";
import { isSafetyCarActive as checkSafetyCarActive } from "../utils/tacticalAlerts";

export interface CardViewProps {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  isSafetyCarActive?: boolean;
  highlightBorder?: boolean;
}

export function CardView({
  title,
  children,
  style,
  isSafetyCarActive = false,
  highlightBorder,
}: CardViewProps) {
  const isFramed = highlightBorder ?? isSafetyCarActive;

  return (
    <View style={[s.card, isFramed && s.cardSafetyCar, style]}>
      <Text style={s.title}>{title}</Text>
      {children}
    </View>
  );
}

export function Card(props: {
  title: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  highlightBorder?: boolean;
}) {
  const safetyCarStatus = useRaceStore((s) => s.safetyCarStatus);
  return (
    <CardView
      {...props}
      isSafetyCarActive={checkSafetyCarActive(safetyCarStatus)}
    />
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
  },
  cardSafetyCar: {
    borderColor: colors.warn,
    borderWidth: 1.5,
  },
  title: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
});
