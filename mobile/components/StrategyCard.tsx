import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import { useRaceStore } from "../store/useRaceStore";
import { useStrategyStore } from "../store/useStrategyStore";
import { useNow } from "../hooks/useNow";
import { Card } from "./Card";
import { colors, compoundColor } from "../ui/theme";
import type { StrategyPlan } from "../models/strategy";

const OUTDATED_AFTER_LAPS = 3;

export interface StrategyCardViewProps {
  plan: StrategyPlan | null;
  status: "idle" | "loading" | "error";
  error: string | null;
  cooldownUntil: number;
  lap: number;
  gameIdeal: number;
  connected: boolean;
  now: number;
  onGenerate: () => void;
}

export function StrategyCardView({
  plan,
  status,
  error,
  cooldownUntil,
  lap,
  gameIdeal,
  connected,
  now,
  onGenerate,
}: StrategyCardViewProps) {
  const cooldown = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const loading = status === "loading";
  const disabled = loading || cooldown > 0 || !connected;

  const noStop = plan?.lapToBox === 0;
  const lapsToGo = plan ? plan.lapToBox - lap : 0;
  const outdated =
    !!plan &&
    (lap - plan.generatedAtLap >= OUTDATED_AFTER_LAPS ||
      (!noStop && lapsToGo < 0));
  const urgent =
    !!plan && !noStop && !outdated && lapsToGo >= 0 && lapsToGo <= 2;

  const headline = !plan
    ? "—"
    : noStop
      ? "NO MORE STOPS"
      : lapsToGo === 0
        ? "BOX THIS LAP"
        : lapsToGo > 0
          ? `BOX LAP ${plan.lapToBox}`
          : `WAS LAP ${plan.lapToBox}`;
  const headColor = outdated
    ? colors.muted
    : urgent
      ? colors.warn
      : colors.accent;

  return (
    <Card title="PIT STRATEGY · AI">
      <Text style={[s.big, { color: headColor }]}>{headline}</Text>

      {plan && !noStop && (
        <View style={s.row}>
          <Text style={s.sub}>
            {lapsToGo > 0 ? `in ${lapsToGo} laps` : " "}
          </Text>
          <View
            style={[s.badge, { borderColor: compoundColor(plan.newTires) }]}
          >
            <Text
              style={[s.badgeText, { color: compoundColor(plan.newTires) }]}
            >
              {plan.newTires.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {plan && <Text style={s.why}>{plan.explanation}</Text>}
      {plan ? (
        <Text style={s.meta}>
          Lap {plan.generatedAtLap} · {plan.confidence} confidence
          {outdated ? " · OUTDATED" : ""}
        </Text>
      ) : (
        <Text style={s.meta}>No plan yet</Text>
      )}
      {error && <Text style={s.err}>{error}</Text>}

      <Pressable
        onPress={onGenerate}
        disabled={disabled}
        style={[s.btn, disabled && { opacity: 0.45 }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.bg} />
        ) : (
          <Text style={s.btnText}>
            {cooldown > 0 ? `WAIT ${cooldown}s` : plan ? "REFRESH" : "GENERATE"}
          </Text>
        )}
      </Pressable>

      {gameIdeal > 0 && (
        <Text style={s.meta}>Game suggests lap {gameIdeal}</Text>
      )}
    </Card>
  );
}

export function StrategyCard() {
  const { plan, status, error, cooldownUntil, generate } = useStrategyStore(
    useShallow((s) => ({
      plan: s.plan,
      status: s.status,
      error: s.error,
      cooldownUntil: s.cooldownUntil,
      generate: s.generate,
    }))
  );
  const { lap, gameIdeal, connected } = useRaceStore(
    useShallow((s) => ({
      lap: s.currentLap,
      gameIdeal: s.pitStopWindowIdealLap,
      connected: s.isConnected,
    }))
  );
  const now = useNow();

  return (
    <StrategyCardView
      plan={plan}
      status={status}
      error={error}
      cooldownUntil={cooldownUntil}
      lap={lap}
      gameIdeal={gameIdeal}
      connected={connected}
      now={now}
      onGenerate={generate}
    />
  );
}

const s = StyleSheet.create({
  big: { fontSize: 26, fontWeight: "900", fontVariant: ["tabular-nums"] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sub: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  badge: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: { fontWeight: "800", fontSize: 13 },
  why: { color: colors.text, fontSize: 14, marginTop: 6 },
  meta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  err: { color: colors.bad, fontSize: 12, marginTop: 4, fontWeight: "700" },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 8,
    minHeight: 36,
  },
  btnText: {
    color: colors.bg,
    fontWeight: "900",
    letterSpacing: 1,
    fontVariant: ["tabular-nums"],
  },
});
