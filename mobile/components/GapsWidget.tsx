import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useRaceStore } from '../store/useRaceStore';
import { Card } from './Card';
import { colors, compoundColor } from '../ui/theme';
import { formatGap, formatLapTime } from '../utils/format';

function Row({ label, gap, sign, lap, compound, age }:
  { label: string; gap: number; sign: '+' | '-'; lap: number; compound: string; age: number }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.gap}>{formatGap(gap, sign)}</Text>
      <View style={s.right}>
        <Text style={s.small}>{formatLapTime(lap)}</Text>
        <Text style={[s.small, { color: compoundColor(compound) }]}>{compound ? `${compound} · ${age}L` : '—'}</Text>
      </View>
    </View>
  );
}

export function GapsWidget() {
  const g = useRaceStore(useShallow((x) => ({
    ahead: x.gapAhead, aheadLap: x.carAheadLastLapTime, aheadC: x.carAheadTireCompound, aheadAge: x.carAheadTireAgeLaps,
    behind: x.gapBehind, behindLap: x.carBehindLastLapTime, behindC: x.carBehindTireCompound, behindAge: x.carBehindTireAgeLaps,
  })));
  return (
    <Card title="GAPS">
      <Row label="AHEAD" gap={g.ahead} sign="-" lap={g.aheadLap} compound={g.aheadC} age={g.aheadAge} />
      <Row label="BEHIND" gap={g.behind} sign="+" lap={g.behindLap} compound={g.behindC} age={g.behindAge} />
    </Card>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', width: 56 },
  gap: { color: colors.text, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  right: { alignItems: 'flex-end' },
  small: { color: colors.text, fontSize: 11, fontVariant: ['tabular-nums'] },
});