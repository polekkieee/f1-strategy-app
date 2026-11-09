import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useRaceStore } from "../store/useRaceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { colors } from "../ui/theme";

const STALE_AFTER_S = 3;

function useStaleness() {
  const lastUpdateMs = useRaceStore((s) => s.lastUpdateMs);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const age = lastUpdateMs ? Math.floor((now - lastUpdateMs) / 1000) : null;
  return { age, stale: age === null || age >= STALE_AFTER_S };
}

export function HeaderBar() {
  const { isConnected, trackName, sessionType, currentLap, totalLaps } =
    useRaceStore(
      useShallow((s) => ({
        isConnected: s.isConnected,
        trackName: s.trackName,
        sessionType: s.sessionType,
        currentLap: s.currentLap,
        totalLaps: s.totalLaps,
        trackStatus: s.safetyCarStatus,
      }))
    );
  const openSettings = useSettingsStore((s) => s.openSettings);
  const { age, stale } = useStaleness();

  const dot = !isConnected ? colors.bad : stale ? colors.warn : colors.good;
  const label = !isConnected
    ? "DISCONNECTED · TAP TO CONFIGURE"
    : age === null
      ? "WAITING FOR DATA"
      : stale
        ? `STALE ${age}s`
        : "LIVE";
  const isAlert = !isConnected;

  return (
    <View style={s.bar}>
      <Pressable
        onPress={openSettings}
        style={[s.statusPill, isAlert && s.statusPillAlert]}
      >
        <View style={[s.dot, { backgroundColor: dot }]} />
        <Text style={[s.status, isAlert && s.statusAlertText]}>{label}</Text>
      </Pressable>
      <Text style={s.mid}>
        {trackName || "—"} · {sessionType || "—"}
      </Text>
      <View style={s.right}>
        <Text style={s.mid}>
          LAP {currentLap}/{totalLaps || "–"}
        </Text>
        <Pressable onPress={openSettings} style={s.settingsBtn}>
          <Text style={s.settingsBtnText}>SETTINGS</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.16)",
    borderWidth: 1,
    borderColor: colors.bad,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  status: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1,
  },
  statusAlertText: {
    color: colors.bad,
    fontWeight: "800",
  },
  mid: { color: colors.text, fontSize: 13, fontWeight: "600" },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  settingsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  settingsBtnText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
