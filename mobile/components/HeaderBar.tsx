import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useRaceStore } from '../store/useRaceStore';
import { colors } from '../ui/theme';

const STALE_AFTER_S = 3;

export function useStaleness() {
  const lastUpdateMs = useRaceStore((s) => s.lastUpdateMs);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const age = lastUpdateMs ? Math.floor((now - lastUpdateMs) / 1000) : null;
  return { age, stale: age === null || age >= STALE_AFTER_S };
}

export function HeaderBar() {
  const { isConnected, trackName, sessionType, currentLap, totalLaps } =
    useRaceStore(useShallow((s) => ({
      isConnected: s.isConnected, trackName: s.trackName, sessionType: s.sessionType,
      currentLap: s.currentLap, totalLaps: s.totalLaps, trackStatus: s.safetyCarStatus,
    })));
  const { age, stale } = useStaleness();

  const dot = !isConnected ? colors.bad : stale ? colors.warn : colors.good;
  const label = !isConnected ? 'DISCONNECTED' : age === null ? 'WAITING FOR DATA' : stale ? `STALE ${age}s` : 'LIVE';

  return (
    <View style={s.bar}>
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: dot }]} />
        <Text style={s.status}>{label}</Text>
      </View>
      <Text style={s.mid}>{trackName || '—'} · {sessionType || '—'}</Text>
      <Text style={s.mid}>LAP {currentLap}/{totalLaps || '–'}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
         paddingHorizontal: 4, paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  status: { color: colors.text, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
  mid: { color: colors.text, fontSize: 13, fontWeight: '600' },
});