import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useRaceStore } from '../store/useRaceStore';
import { Card } from './Card';
import { colors } from '../ui/theme';
import { formatLapTime } from '../utils/format';

const Stat = ({ k, v }: { k: string; v: string }) => (
  <View style={s.stat}><Text style={s.k}>{k}</Text><Text style={s.v}>{v}</Text></View>
);

export function PaceWidget() {
  const p = useRaceStore(useShallow((x) => ({
    pos: x.playerPosition, last: x.lastLapTime, best: x.bestLapTime,
    ers: x.ersStorage, weather: x.weather,
    dmg: x.carDamage.length, pen: x.playerPenalties.length,
  })));
  return (
    <Card title="RACE">
      <Text style={s.pos}>P{p.pos || '–'}</Text>
      <Stat k="LAST" v={formatLapTime(p.last)} />
      <Stat k="BEST" v={formatLapTime(p.best)} />
      {/* ASSUMPTION: ersStorage is raw joules (max ~4 MJ). Tell me if it's already a percentage. */}
      <Stat k="ERS" v={`${Math.min(100, (p.ers / 4_000_000) * 100).toFixed(0)}%`} />
      <Stat k="WEATHER" v={p.weather || '—'} />
      {(p.dmg > 0 || p.pen > 0) && (
        <Text style={s.alert}>{p.dmg > 0 ? `⚠ DAMAGE (${p.dmg}) ` : ''}{p.pen > 0 ? `⚠ PENALTY (${p.pen})` : ''}</Text>
      )}
    </Card>
  );
}
const s = StyleSheet.create({
  pos: { color: colors.text, fontSize: 56, fontWeight: '900', fontVariant: ['tabular-nums'], lineHeight: 60 },
  stat: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  k: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  v: { color: colors.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  alert: { color: colors.bad, fontWeight: '800', marginTop: 6 },
});