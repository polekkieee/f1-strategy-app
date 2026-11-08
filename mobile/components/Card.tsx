import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../ui/theme';

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.card}>
      <Text style={s.title}>{title}</Text>
      {children}
    </View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1,
          borderColor: colors.border, padding: 12, marginBottom: 8 },
  title: { color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
});