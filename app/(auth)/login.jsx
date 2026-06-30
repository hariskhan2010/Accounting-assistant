import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { FadeInView } from "@/components/animated/FadeInView";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { signInWithOtp } from "@/services/auth";
import { colors } from "@/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const login = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await signInWithOtp(email);
    setLoading(false);
    if (!error) setSent(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      <View style={styles.container}>
        {sent ? (
          <FadeInView delay={200} direction="up">
            <View style={styles.sentBox}>
              <View style={styles.successIcon}>
                <Ionicons color={colors.success} name="checkmark-circle" size={48} />
              </View>
              <Text style={styles.sentTitle}>Check your email</Text>
              <Text style={styles.sentText}>A login link has been sent to {email}</Text>
            </View>
          </FadeInView>
        ) : (
          <>
            <FadeInView delay={200}>
              <Text style={styles.title}>Gems & Minerals</Text>
              <Text style={styles.subtitle}>Accounting System</Text>
            </FadeInView>

            <FadeInView delay={300} direction="up" style={styles.inputWrap}>
              <LuxuryTextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="Enter your email"
                value={email}
              />
            </FadeInView>

            <FadeInView delay={400} style={styles.buttonWrap}>
              <AnimatedGoldButton
                disabled={loading || !email.trim()}
                onPress={login}
                title={loading ? "Sending..." : "Send Login Link"}
              />
            </FadeInView>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  buttonWrap: {
    width: "100%"
  },
  container: {
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 32,
    width: "100%"
  },
  inputWrap: {
    width: "100%"
  },
  screen: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center"
  },
  sentBox: {
    alignItems: "center",
    gap: 12
  },
  sentText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center"
  },
  sentTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: "center"
  },
  successIcon: {
    alignItems: "center",
    backgroundColor: "rgba(26, 188, 156, 0.1)",
    borderRadius: 36,
    height: 72,
    justifyContent: "center",
    width: 72
  },
  title: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center"
  }
});
