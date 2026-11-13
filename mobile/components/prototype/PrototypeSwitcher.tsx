import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "../../ui/theme";

export interface VariantOption {
  key: "A" | "B" | "C";
  name: string;
  sub: string;
}

export const PROTOTYPE_VARIANTS: VariantOption[] = [
  {
    key: "A",
    name: "Variant A (Ergonomic Thumb-Wings)",
    sub: "Split Outer Touch Zones",
  },
  {
    key: "B",
    name: "Variant B (Lower Command Deck)",
    sub: "Top Grid + 4-Button Deck",
  },
  {
    key: "C",
    name: "Variant C (Hybrid Widget-Buttons)",
    sub: "Hero Card + Action Pillar",
  },
];

interface Props {
  current: "A" | "B" | "C";
  onChange: (next: "A" | "B" | "C") => void;
}

export function PrototypeSwitcher({ current, onChange }: Props) {
  const currentIndex = PROTOTYPE_VARIANTS.findIndex((v) => v.key === current);
  const active = PROTOTYPE_VARIANTS[currentIndex] ?? PROTOTYPE_VARIANTS[0];

  const cycle = (delta: number) => {
    const nextIdx =
      (currentIndex + delta + PROTOTYPE_VARIANTS.length) %
      PROTOTYPE_VARIANTS.length;
    onChange(PROTOTYPE_VARIANTS[nextIdx].key);
  };

  return (
    <View style={s.floatingBar}>
      <Pressable
        style={s.arrowBtn}
        onPress={() => cycle(-1)}
        accessibilityLabel="Previous Variant"
      >
        <Text style={s.arrowText}>◀</Text>
      </Pressable>

      <View style={s.labelContainer}>
        <Text style={s.titleText}>{active.name}</Text>
        <Text style={s.subText}>{active.sub}</Text>
      </View>

      <Pressable
        style={s.arrowBtn}
        onPress={() => cycle(1)}
        accessibilityLabel="Next Variant"
      >
        <Text style={s.arrowText}>▶</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  floatingBar: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  arrowBtn: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
  labelContainer: {
    alignItems: "center",
    minWidth: 230,
  },
  titleText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "600",
  },
});
