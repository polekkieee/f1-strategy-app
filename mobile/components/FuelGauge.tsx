import { View, Text, StyleSheet } from "react-native";
import { useRaceStore } from "../store/useRaceStore";
import { Card } from "./Card";
import { colors } from "../ui/theme";
import { formatFuelMargin, getFuelThreshold, FuelStatus } from "../utils/fuel";

const STATUS_LABELS: Record<FuelStatus, string> = {
  deficit: "DEFICIT",
  caution: "CAUTION",
  safe: "SURPLUS",
};

export interface FuelGaugeViewProps {
  margin: number;
}

export function FuelGaugeView({ margin }: FuelGaugeViewProps) {
  const threshold = getFuelThreshold(margin);
  const formattedMargin = formatFuelMargin(margin);
  const statusLabel = STATUS_LABELS[threshold.status];

  // Visual gauge bar mapping: range from -2.0 to +2.0 laps (clamped)
  const clampedMargin = Math.max(-2, Math.min(2, margin));
  // percentage for indicator cursor (0% at -2.0 laps, 50% at 0.0 laps, 100% at +2.0 laps)
  const cursorPercent = ((clampedMargin + 2) / 4) * 100;

  return (
    <Card title="FUEL MARGIN">
      <View style={s.headerRow}>
        <Text style={[s.value, { color: threshold.color }]}>
          {formattedMargin}
        </Text>
        <View style={[s.badge, { borderColor: threshold.color }]}>
          <Text style={[s.badgeText, { color: threshold.color }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={s.gaugeContainer}>
        <View style={s.track}>
          {/* Zero baseline marker */}
          <View style={s.zeroMarker} />
          {/* +0.5 safe threshold marker */}
          <View style={s.safeMarker} />
          {/* Cursor indicator */}
          <View
            style={[
              s.cursor,
              { left: `${cursorPercent}%`, backgroundColor: threshold.color },
            ]}
          />
        </View>
        <View style={s.scaleLabels}>
          <Text style={s.scaleText}>-2.0</Text>
          <Text style={[s.scaleText, s.scaleZero]}>0.0</Text>
          <Text style={[s.scaleText, s.scaleSafe]}>+0.5</Text>
          <Text style={s.scaleText}>+2.0</Text>
        </View>
      </View>
    </Card>
  );
}

export function FuelGauge() {
  const margin = useRaceStore((s) => s.fuelRemainingLaps);
  return <FuelGaugeView margin={margin} />;
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  value: {
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  gaugeContainer: {
    marginTop: 4,
  },
  track: {
    height: 10,
    backgroundColor: "#1e293b",
    borderRadius: 5,
    position: "relative",
    overflow: "visible",
    justifyContent: "center",
  },
  zeroMarker: {
    position: "absolute",
    left: "50%",
    width: 2,
    height: 14,
    top: -2,
    backgroundColor: colors.muted,
  },
  safeMarker: {
    position: "absolute",
    left: "62.5%", // 0.5 laps in [-2, +2] range: (0.5+2)/4 = 62.5%
    width: 2,
    height: 14,
    top: -2,
    backgroundColor: colors.muted,
    opacity: 0.6,
  },
  cursor: {
    position: "absolute",
    width: 6,
    height: 16,
    top: -3,
    marginLeft: -3,
    borderRadius: 3,
  },
  scaleLabels: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  scaleZero: {
    position: "absolute",
    left: "50%",
    marginLeft: -8,
  },
  scaleSafe: {
    position: "absolute",
    left: "62.5%",
    marginLeft: -10,
  },
  scaleText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
