import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useTelemetry } from './hooks/useTelemetry';
import { colors } from './ui/theme';
import { HeaderBar } from './components/HeaderBar';
import { TyreWidget } from './components/TyreWidget';
import { GapsWidget } from './components/GapsWidget';
import { PaceWidget } from './components/PaceWidget';
import { StatusWidget } from './components/StatusWidget';
import { StrategyCard } from './components/StrategyCard';

export default function App() {
  useTelemetry();
  useKeepAwake();
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return (
    <View style={s.root}>
      <HeaderBar />
      <View style={s.cols}>
        <View style={s.col}><PaceWidget /></View>
        <View style={s.col}><TyreWidget /><StrategyCard /></View>
        <View style={s.col}><GapsWidget /><StatusWidget /></View>
      </View>
      <StatusBar style="light" hidden />
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 12, paddingTop: 10 },
  cols: { flex: 1, flexDirection: 'row', gap: 8 },
  col: { flex: 1 },
});