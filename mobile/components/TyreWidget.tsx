import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useRaceStore } from "../store/useRaceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { Card } from "./Card";
import { colors, compoundColor } from "../ui/theme";
import { formatTyreAgeDisplay } from "../utils/format";
import {
  getTyreTempColor,
  getTyreWearColor,
  formatTyreWear,
} from "../utils/tyre";

export interface TyreCornerData {
  label: "LF" | "RF" | "LR" | "RR" | string;
  wear: number;
  surfaceTemp: number;
  innerTemp: number;
}

export interface TyreWidgetViewProps {
  compound: string;
  actualCompound: string;
  tyreAge: number;
  showActualCompound: boolean;
  corners: {
    lf: TyreCornerData;
    rf: TyreCornerData;
    lr: TyreCornerData;
    rr: TyreCornerData;
  };
}

function DualTempCorner({ corner }: { corner: TyreCornerData }) {
  const wearClr = getTyreWearColor(corner.wear);
  const surfClr = getTyreTempColor(corner.surfaceTemp);
  const innerClr = getTyreTempColor(corner.innerTemp);

  return (
    <View style={[s.corner, { borderColor: wearClr }]}>
      <View style={s.cornerHeader}>
        <Text style={s.cLabel}>{corner.label}</Text>
        <Text style={[s.wearVal, { color: wearClr }]}>
          {formatTyreWear(corner.wear)}
        </Text>
      </View>
      <View style={s.tempMatrix}>
        <View style={s.tempRow}>
          <Text style={s.tempTypeLabel}>SURF</Text>
          <Text style={[s.tempVal, { color: surfClr }]}>
            {`${Math.round(corner.surfaceTemp || 0)}°C`}
          </Text>
        </View>
        <View style={s.tempRow}>
          <Text style={s.tempTypeLabel}>CARC</Text>
          <Text style={[s.tempVal, { color: innerClr }]}>
            {`${Math.round(corner.innerTemp || 0)}°C`}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function TyreWidgetView({
  compound,
  actualCompound,
  tyreAge,
  showActualCompound,
  corners,
}: TyreWidgetViewProps) {
  const badgeText = (compound || "—").toUpperCase();
  const ageDisplay = formatTyreAgeDisplay(
    tyreAge,
    compound,
    actualCompound,
    showActualCompound
  );

  return (
    <Card title="TYRES">
      <View style={s.head}>
        <View style={[s.badge, { borderColor: compoundColor(compound) }]}>
          <Text style={[s.badgeText, { color: compoundColor(compound) }]}>
            {badgeText}
          </Text>
        </View>
        <Text style={s.age}>{ageDisplay}</Text>
      </View>
      <View style={s.grid}>
        {DualTempCorner({ corner: corners.lf })}
        {DualTempCorner({ corner: corners.rf })}
        {DualTempCorner({ corner: corners.lr })}
        {DualTempCorner({ corner: corners.rr })}
      </View>
    </Card>
  );
}

export function TyreWidget() {
  const t = useRaceStore(
    useShallow((x) => ({
      c: x.visualTyreCompound || x.tireCompound,
      actual: x.actualTyreCompound,
      age: x.tireAgeLaps,
      lfWear: x.tireWearLF,
      rfWear: x.tireWearRF,
      lrWear: x.tireWearLR,
      rrWear: x.tireWearRR,
      lfSurf: x.tyreSurfaceTempLF,
      rfSurf: x.tyreSurfaceTempRF,
      lrSurf: x.tyreSurfaceTempLR,
      rrSurf: x.tyreSurfaceTempRR,
      lfInner: x.tyreInnerTempLF,
      rfInner: x.tyreInnerTempRF,
      lrInner: x.tyreInnerTempLR,
      rrInner: x.tyreInnerTempRR,
    }))
  );
  const showActual = useSettingsStore((s) => s.showActualTyreCompound);

  const corners = {
    lf: {
      label: "LF",
      wear: t.lfWear,
      surfaceTemp: t.lfSurf,
      innerTemp: t.lfInner,
    },
    rf: {
      label: "RF",
      wear: t.rfWear,
      surfaceTemp: t.rfSurf,
      innerTemp: t.rfInner,
    },
    lr: {
      label: "LR",
      wear: t.lrWear,
      surfaceTemp: t.lrSurf,
      innerTemp: t.lrInner,
    },
    rr: {
      label: "RR",
      wear: t.rrWear,
      surfaceTemp: t.rrSurf,
      innerTemp: t.rrInner,
    },
  };

  return (
    <TyreWidgetView
      compound={t.c}
      actualCompound={t.actual}
      tyreAge={t.age}
      showActualCompound={showActual}
      corners={corners}
    />
  );
}

const s = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  badge: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: { fontWeight: "800", fontSize: 14 },
  age: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  corner: {
    width: "48%",
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 6,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
  },
  cornerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  cLabel: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  wearVal: {
    fontSize: 17,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  tempMatrix: {
    marginTop: 2,
    paddingTop: 3,
    borderTopWidth: StyleSheet.hairlineWidth || 1,
    borderTopColor: colors.border,
    gap: 2,
  },
  tempRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tempTypeLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  tempVal: {
    fontSize: 13,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});
