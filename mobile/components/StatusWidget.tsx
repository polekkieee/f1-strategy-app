import { View, Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useRaceStore } from '../store/useRaceStore';
import { Card } from './Card';
import { colors } from '../ui/theme';

export function StatusWidget() {
    const x = useRaceStore(useShallow((s) => ({
        fuel: s.fuelRemainingLaps, stops: s.numPitStopsTaken,
        pit: s.pitStatus, pen: s.totalPenaltySeconds,
    })));
    const fuelColor = x.fuel < 0 ? colors.bad : x.fuel < 0.5 ? colors.warn : colors.good;
    return (
        <Card title="STATUS">
            {x.pit === 'pitting' && <Text style={s.banner}>IN PIT LANE</Text>}
            <Row k="FUEL MARGIN" v={`${x.fuel >= 0 ? '+' : ''}${x.fuel.toFixed(1)} laps`} color={fuelColor} />
            {x.pen > 0 && <Row k="PENALTY" v={`+${x.pen}s`} color={colors.bad} />}
        </Card>
    );
}
const Row = ({ k, v, color }: { k: string; v: string; color?: string }) => (
    <View style={s.row}>
        <Text style={s.k}>{k}</Text>
        <Text style={[s.v, color ? { color } : null]}>{v}</Text>
    </View>
);
const s = StyleSheet.create({
    banner: { color: colors.warn, fontWeight: '900', fontSize: 16, marginBottom: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
    k: { color: colors.muted, fontSize: 11, fontWeight: '700' },
    v: { color: colors.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
});