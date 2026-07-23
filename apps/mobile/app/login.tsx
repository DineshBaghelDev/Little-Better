import { Ionicons } from "@expo/vector-icons";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Mascot, PrimaryButton } from "../src/components/ui";
import { colors, radii, spacing } from "../src/theme";

export default function LoginScreen() {
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const normalized = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(normalized)) {
      setError("Use 3-30 letters, numbers, dots, dashes, or underscores.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "signUp" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await signIn("password", { flow: mode, password, username: normalized });
    } catch {
      setError(mode === "signIn" ? "Username or password is incorrect." : "That username is unavailable.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode() {
    setMode((current) => (current === "signIn" ? "signUp" : "signIn"));
    setConfirmPassword("");
    setError("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.grow}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <Mascot size={136} variant="watering" />
            <Text style={styles.title}>Little Better</Text>
            <Text style={styles.subtitle}>{mode === "signIn" ? "Welcome back" : "Start your space"}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Ionicons color={colors.muted} name="person-outline" size={20} />
              <TextInput
                accessibilityLabel="Username"
                autoCapitalize="none"
                autoComplete="username"
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={colors.muted}
                returnKeyType="next"
                style={styles.input}
                value={username}
              />
            </View>
            <View style={styles.field}>
              <Ionicons color={colors.muted} name="lock-closed-outline" size={20} />
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                onChangeText={setPassword}
                onSubmitEditing={mode === "signIn" ? submit : undefined}
                placeholder="Password"
                placeholderTextColor={colors.muted}
                returnKeyType={mode === "signIn" ? "done" : "next"}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>
            {mode === "signUp" ? (
              <View style={styles.field}>
                <Ionicons color={colors.muted} name="shield-checkmark-outline" size={20} />
                <TextInput
                  accessibilityLabel="Confirm password"
                  autoCapitalize="none"
                  autoComplete="new-password"
                  onChangeText={setConfirmPassword}
                  onSubmitEditing={submit}
                  placeholder="Confirm password"
                  placeholderTextColor={colors.muted}
                  returnKeyType="done"
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                />
              </View>
            ) : null}
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <PrimaryButton label={submitting ? "Please wait..." : mode === "signIn" ? "Sign in" : "Create account"} onPress={submitting ? () => undefined : submit} />
            <Pressable accessibilityRole="button" onPress={switchMode} style={styles.switchButton}>
              <Text style={styles.switchText}>{mode === "signIn" ? "Create an account" : "I already have an account"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  grow: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.xl },
  brand: { alignItems: "center", marginBottom: spacing.xl },
  title: { color: colors.text, fontSize: 30, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: spacing.xs },
  form: { gap: spacing.md, width: "100%" },
  field: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingHorizontal: spacing.md,
  },
  input: { color: colors.text, flex: 1, fontSize: 16, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  error: { color: colors.coral, fontSize: 13, fontWeight: "600", textAlign: "center" },
  switchButton: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  switchText: { color: colors.primaryDark, fontSize: 14, fontWeight: "700" },
});
