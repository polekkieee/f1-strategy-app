import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useShallow } from "zustand/react/shallow";
import { testBackendConnection } from "../config";
import { useSettingsStore } from "../store/useSettingsStore";
import { colors } from "../ui/theme";

type TestStatus =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; host: string }
  | { kind: "error"; error: string };

export function SettingsSheet() {
  const { backendHost, isSettingsOpen, setBackendHost, closeSettings } =
    useSettingsStore(
      useShallow((s) => ({
        backendHost: s.backendHost,
        isSettingsOpen: s.isSettingsOpen,
        setBackendHost: s.setBackendHost,
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
    <Modal
      visible={isSettingsOpen}
      animationType="slide"
      transparent
      onRequestClose={closeSettings}
    >
      <View style={s.backdrop}>
        <Pressable style={s.dismissArea} onPress={closeSettings} />
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>CONNECTION SETTINGS</Text>
            <Pressable onPress={closeSettings} style={s.closeBtn}>
              <Text style={s.closeText}>CLOSE</Text>
            </Pressable>
          </View>

          <Text style={s.label}>BACKEND LAN HOST (IP:PORT)</Text>
          <TextInput
            value={draftHost}
            onChangeText={(text) => {
              setDraftHost(text);
              if (testState.kind !== "idle") setTestState({ kind: "idle" });
            }}
            placeholder="192.168.1.50:5000"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={s.input}
          />
          <Text style={s.hint}>
            Active telemetry & strategy endpoint: ws://{backendHost}
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

          <View style={s.actions}>
            <Pressable
              onPress={handleTestConnection}
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

            <Pressable onPress={handleSave} style={s.primaryBtn}>
              <Text style={s.primaryBtnText}>SAVE & CONNECT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(11, 17, 32, 0.78)",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    width: 420,
    maxWidth: "85%",
    height: "100%",
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderColor: colors.border,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
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
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontVariant: ["tabular-nums"],
  },
  hint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6,
  },
  feedback: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    minHeight: 40,
  },
  secondaryBtnText: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    minHeight: 40,
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
