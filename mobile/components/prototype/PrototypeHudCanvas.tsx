import React, { useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { colors } from "../../ui/theme";
import { HeaderBar } from "../HeaderBar";
import { PrototypeSwitcher } from "./PrototypeSwitcher";
import { HudVariantA } from "./HudVariantA";
import { HudVariantB } from "./HudVariantB";
import { HudVariantC } from "./HudVariantC";
import { DEFAULT_PROTOTYPE_DATA, type MockTelemetry } from "./PrototypeShared";

interface Props {
  initialVariant?: "A" | "B" | "C";
  telemetry?: MockTelemetry;
}

export function PrototypeHudCanvas({
  initialVariant = "A",
  telemetry = DEFAULT_PROTOTYPE_DATA,
}: Props) {
  const windowDims = useWindowDimensions();
  const width = windowDims?.width ?? 844;
  const isTablet = width >= 768;

  const [variant, setVariant] = useState<"A" | "B" | "C">(initialVariant);
  const [radioBanner, setRadioBanner] = useState<string | null>(null);

  const handlePrompt = (promptKey: string) => {
    let msg = "";
    if (promptKey === "BOX_THIS_LAP") {
      msg =
        '📻 "Box, box. Pit confirm received. Inters ready, exit P7 in clean air."';
    } else if (promptKey === "CROSSOVER") {
      msg =
        '📻 "Rain update: 18% track dampness. Intermediate crossover in 2m45s."';
    } else if (promptKey === "REJOIN") {
      msg =
        '📻 "Rejoin status: Pit now exits P7. Clean air window 4.2s ahead of Alonso."';
    } else if (promptKey === "TYRE_STATUS") {
      msg =
        '📻 "Tyres: Rear carcass running 103°C. Thermal degradation is within limits."';
    }
    setRadioBanner(msg);
    setTimeout(() => setRadioBanner(null), 4000);
  };

  return (
    <View style={[s.root, isTablet && s.rootTablet]}>
      <HeaderBar />

      {/* Simulated Tactical Engineer Voice Response Banner */}
      {radioBanner && (
        <View style={s.radioBanner}>
          <Text style={s.radioBannerText}>{radioBanner}</Text>
        </View>
      )}

      {/* Switchable Radical UI Variants */}
      <View style={s.variantContainer}>
        {variant === "A" && (
          <HudVariantA data={telemetry} onPrompt={handlePrompt} />
        )}
        {variant === "B" && (
          <HudVariantB data={telemetry} onPrompt={handlePrompt} />
        )}
        {variant === "C" && (
          <HudVariantC data={telemetry} onPrompt={handlePrompt} />
        )}
      </View>

      {/* Floating Prototype Switcher Bar */}
      <PrototypeSwitcher current={variant} onChange={setVariant} />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 8,
    paddingTop: 8,
    position: "relative",
  },
  rootTablet: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  variantContainer: {
    flex: 1,
    marginTop: 6,
  },
  radioBanner: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 900,
    elevation: 8,
  },
  radioBannerText: {
    color: "#f8fafc",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
});
