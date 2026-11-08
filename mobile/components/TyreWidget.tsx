import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useRaceStore } from '../store/useRaceStore';
import { Card } from './Card';
import { colors, compoundColor } from '../ui/theme';

// ASSUMPTION: wear is a percentage 0-100 (0 = new). Adjust thresholds to taste.
const wearColor = (w: number) => (w >= 70 ? colors.bad : w >= 50 ? colors.warn : colors.good);

function Corner({ label, wear }: { label: string; wear: number }) {
  return (
    <View style={[s.corner, { borderColor: wearColor(wear) }]}>
      <Text style={s.cLabel}>{label}</Text>
      <Text style={[s.cVal, { color: wearColor(wear) }]}>{wear.toFixed(0)}%</Text>
    </View>
  );
}

export function TyreWidget() {
  const t = useRaceStore(useShallow((x) => ({
    c: x.tireCompound, age: x.tireAgeLaps,
    lf: x.tireWearLF, rf: x.tireWearRF, lr: x.tireWearLR, rr: x.tireWearRR,
  })));
  return (
    <Card title="TYRES">
      <View style={s.head}>
        <View style={[s.badge, { borderColor: compoundColor(t.c) }]}>
          <Text style={[s.badgeText, { color: compoundColor(t.c) }]}>{(t.c || '—').toUpperCase()}</Text>
        </View>
        <Text style={s.age}>{t.age} laps</Text>
      </View>
      <View style={s.grid}>
        <Corner label="FL" wear={t.lf} /><Corner label="FR" wear={t.rf} />
        <Corner label="RL" wear={t.lr} /><Corner label="RR" wear={t.rr} />
      </View>
    </Card>
  );
}
const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  badge: { borderWidth: 2, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontWeight: '800', fontSize: 14 },
  age: { color: colors.text, fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  corner: { width: '48%', borderWidth: 1.5, borderRadius: 8, padding: 6, alignItems: 'center' },
  cLabel: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  cVal: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
});