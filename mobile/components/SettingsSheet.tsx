import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { LandscapeModal, LANDSCAPE_MODAL_ORIENTATIONS } from "./LandscapeModal";
import { useShallow } from "zustand/react/shallow";
import { testBackendConnection } from "../config";
import {
  useSettingsStore,
  HUD_LAYOUT_OPTIONS,
  type HudLayoutType,
} from "../store/useSettingsStore";
import { colors } from "../ui/theme";

export type TestStatus =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; host: string }
  | { kind: "error"; error: string };

export interface SettingsSheetViewProps {
  isOpen: boolean;
  activeHost: string;
  draftHost: string;
  testState: TestStatus;
  showActualTyreCompound: boolean;
  enableHapticAlerts: boolean;
  hudLayout?: HudLayoutType;
  onDraftHostChange: (text: string) => void;
  onTestConnection: () => void;
  onSave: () => void;
  onToggleActualTyre: (val: boolean) => void;
  onToggleHaptics: (val: boolean) => void;
  onSelectHudLayout?: (layout: HudLayoutType) => void;
  onClose: () => void;
}

export function SettingsSheetView({
  isOpen,
  activeHost,
  draftHost,
  testState,
  showActualTyreCompound,
  enableHapticAlerts,
  hudLayout = "thumb_wings",
  onDraftHostChange,
  onTestConnection,
  onSave,
  onToggleActualTyre,
  onToggleHaptics,
  onSelectHudLayout,
  onClose,
}: SettingsSheetViewProps) {
  return (
    <LandscapeModal
      visible={isOpen}
      animationType="slide"
      supportedOrientations={LANDSCAPE_MODAL_ORIENTATIONS}
      onRequestClose={onClose}
    >
      <View style={s.backdrop}>
        <Pressable style={s.dismissArea} onPress={onClose} />
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>SETTINGS</Text>
            <Pressable onPress={onClose} style={s.closeBtn}>
              <Text style={s.closeText}>CLOSE</Text>
            </Pressable>
          </View>

          <ScrollView
            style={s.scrollBody}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.label}>BACKEND LAN HOST (IP:PORT)</Text>
            <TextInput
              value={draftHost}
              onChangeText={onDraftHostChange}
              placeholder="192.168.1.50:5000"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={s.input}
            />
            <Text style={s.hint}>
              Active telemetry & strategy endpoint: ws://{activeHost}
            </Text>

            {testState.kind === "ok" && (
              <Text style={[s.feedback, { color: colors.good }]}>
                Connected to {testState.host}
              </Text>
            )}
            {testState.kind === "error" && (
              <Text style={[s.feedback, { color: colors.bad }]}>
                Connection failed: {testState.error}
              </Text>
            )}

            <View style={s.divider} />

            <View style={s.toggleRow}>
              <View style={s.toggleInfo}>
                <Text style={s.toggleLabel}>
                  Show Actual Tyre Compound (C1–C5)
                </Text>
                <Text style={s.toggleHint}>
                  Display underlying Pirelli grade alongside tyre age in Tyre
                  widget
                </Text>
              </View>
              <Switch
                value={showActualTyreCompound}
                onValueChange={onToggleActualTyre}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
                accessibilityLabel="Show Actual Tyre Compound (C1–C5)"
              />
            </View>

            <View style={s.toggleRow}>
              <View style={s.toggleInfo}>
                <Text style={s.toggleLabel}>Enable Haptic Alerts</Text>
                <Text style={s.toggleHint}>
                  Trigger vibration pulses on rig mount for critical race events
                </Text>
              </View>
              <Switch
                value={enableHapticAlerts}
                onValueChange={onToggleHaptics}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor={colors.text}
                accessibilityLabel="Enable Haptic Alerts"
              />
            </View>

            <View style={s.divider} />

            {/* HUD Rig Layout Selection */}
            <Text style={s.sectionHeader}>HUD RIG LAYOUT</Text>
            <Text style={s.sectionHint}>
              Select the interface structure optimized for your rig and wheel
              mount
            </Text>

            <View style={s.layoutGrid}>
              {HUD_LAYOUT_OPTIONS.map((opt) => {
                const isSelected = opt.id === hudLayout;
                return (
                  <Pressable
                    key={opt.id}
                    style={[s.layoutCard, isSelected && s.layoutCardSelected]}
                    onPress={() => onSelectHudLayout?.(opt.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${opt.title} layout`}
                  >
                    <View style={s.layoutCardHead}>
                      <Text
                        style={[
                          s.layoutTitle,
                          isSelected && s.layoutTitleSelected,
                        ]}
                      >
                        {opt.title}
                      </Text>
                      {isSelected && (
                        <Text style={s.layoutSelectedTag}>ACTIVE</Text>
                      )}
                    </View>
                    <Text style={s.layoutSubtitle}>{opt.subtitle}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.actions}>
              <Pressable
                onPress={onTestConnection}
                disabled={testState.kind === "testing"}
                style={[
                  s.secondaryBtn,
                  testState.kind === "testing" && s.disabledBtn,
                ]}
              >
                {testState.kind === "testing" ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={s.secondaryBtnText}>TEST CONNECTION</Text>
                )}
              </Pressable>

              <Pressable onPress={onSave} style={s.primaryBtn}>
                <Text style={s.primaryBtnText}>SAVE & CONNECT</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </LandscapeModal>
  );
}

export function SettingsSheet() {
  const {
    backendHost,
    showActualTyreCompound,
    enableHapticAlerts,
    hudLayout,
    isSettingsOpen,
    setBackendHost,
    setShowActualTyreCompound,
    setEnableHapticAlerts,
    setHudLayout,
    closeSettings,
  } = useSettingsStore(
    useShallow((s) => ({
      backendHost: s.backendHost,
      showActualTyreCompound: s.showActualTyreCompound,
      enableHapticAlerts: s.enableHapticAlerts,
      hudLayout: s.hudLayout,
      isSettingsOpen: s.isSettingsOpen,
      setBackendHost: s.setBackendHost,
      setShowActualTyreCompound: s.setShowActualTyreCompound,
      setEnableHapticAlerts: s.setEnableHapticAlerts,
      setHudLayout: s.setHudLayout,
      closeSettings: s.closeSettings,
    }))
  );

  const [draftHost, setDraftHost] = useState(backendHost);
  const [testState, setTestState] = useState<TestStatus>({ kind: "idle" });

  useEffect(() => {
    if (isSettingsOpen) {
      setDraftHost(backendHost);
      setTestState({ kind: "idle" });
    }
  }, [backendHost, isSettingsOpen]);

  const handleTestConnection = async () => {
    setTestState({ kind: "testing" });
    const result = await testBackendConnection(draftHost);
    if (result.ok) {
      setDraftHost(result.host);
      setTestState({ kind: "ok", host: result.host });
    } else {
      setTestState({ kind: "error", error: result.error });
    }
  };

  const handleSave = async () => {
    const saved = await setBackendHost(draftHost);
    setDraftHost(saved);
    closeSettings();
  };

  return (
    <SettingsSheetView
      isOpen={isSettingsOpen}
      activeHost={backendHost}
      draftHost={draftHost}
      testState={testState}
      showActualTyreCompound={showActualTyreCompound}
      enableHapticAlerts={enableHapticAlerts}
      hudLayout={hudLayout}
      onDraftHostChange={(text) => {
        setDraftHost(text);
        if (testState.kind !== "idle") setTestState({ kind: "idle" });
      }}
      onTestConnection={handleTestConnection}
      onSave={handleSave}
      onToggleActualTyre={(val) => {
        void setShowActualTyreCompound(val);
      }}
      onToggleHaptics={(val) => {
        void setEnableHapticAlerts(val);
      }}
      onSelectHudLayout={(layout) => {
        void setHudLayout(layout);
      }}
      onClose={closeSettings}
    />
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(11, 17, 32, 0.78)",
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    width: 440,
    maxWidth: "88%",
    height: "100%",
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: "monospace",
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6,
  },
  feedback: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  toggleHint: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeader: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 2,
    marginTop: 4,
  },
  sectionHint: {
    color: colors.muted,
    fontSize: 10,
    marginBottom: 8,
  },
  layoutGrid: {
    gap: 6,
    marginBottom: 6,
  },
  layoutCard: {
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  layoutCardSelected: {
    borderColor: colors.accent,
    backgroundColor: "#112240",
  },
  layoutCardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  layoutTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
  layoutTitleSelected: {
    color: colors.accent,
  },
  layoutSelectedTag: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  layoutSubtitle: {
    color: colors.muted,
    fontSize: 9,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.6,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: colors.bg,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
