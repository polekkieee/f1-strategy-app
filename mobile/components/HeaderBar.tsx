import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useRaceStore } from "../store/useRaceStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { usePostRaceStore } from "../store/usePostRaceStore";
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

export interface HeaderBarViewProps {
  isConnected: boolean;
  trackName: string;
  sessionType: string;
  currentLap: number;
  totalLaps: number;
  sessionStatus?: string;
  age: number | null;
  stale: boolean;
  onOpenSettings: () => void;
  onOpenSummary: () => void;
}

export function HeaderBarView({
  isConnected,
  trackName,
  sessionType,
  currentLap,
  totalLaps,
  sessionStatus,
  age,
  stale,
  onOpenSettings,
  onOpenSummary,
}: HeaderBarViewProps) {
  const isCompleted = sessionStatus?.toLowerCase() === "completed";
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
        onPress={onOpenSettings}
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
        {isCompleted && (
          <Pressable onPress={onOpenSummary} style={s.summaryBtn}>
            <Text style={s.summaryBtnText}>POST-RACE SUMMARY</Text>
          </Pressable>
        )}
        <Pressable onPress={onOpenSettings} style={s.settingsBtn}>
          <Text style={s.settingsBtnText}>SETTINGS</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function HeaderBar() {
  const {
    isConnected,
    trackName,
    sessionType,
    currentLap,
    totalLaps,
    sessionStatus,
  } = useRaceStore(
    useShallow((s) => ({
      isConnected: s.isConnected,
      trackName: s.trackName,
      sessionType: s.sessionType,
      currentLap: s.currentLap,
      totalLaps: s.totalLaps,
      sessionStatus: s.sessionStatus,
    }))
  );
  const openSettings = useSettingsStore((s) => s.openSettings);
  const openSummary = usePostRaceStore((s) => s.openSummary);
  const { age, stale } = useStaleness();

  return (
    <HeaderBarView
      isConnected={isConnected}
      trackName={trackName}
      sessionType={sessionType}
      currentLap={currentLap}
      totalLaps={totalLaps}
      sessionStatus={sessionStatus}
      age={age}
      stale={stale}
      onOpenSettings={openSettings}
      onOpenSummary={openSummary}
    />
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
  summaryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  summaryBtnText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
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
