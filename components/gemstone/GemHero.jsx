import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme";

export function GemHero({ compact = false }) {
  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      <View style={styles.mark}>
        <Ionicons name="diamond" size={compact ? 34 : 46} color={colors.background} />
      </View>
      <View style={styles.glowRing} />
      <View style={styles.glowRingOuter} />
      {!compact ? (
        <View style={styles.copy}>
          <Text style={styles.title}>Gems & Minerals</Text>
          <Text style={styles.subtitle}>Accounting and stock control</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    minHeight: 96
  },
  copy: {
    alignItems: "center",
    gap: 4
  },
  glowRing: {
    borderColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 50,
    borderWidth: 1.5,
    height: 92,
    left: -8,
    position: "absolute",
    top: -8,
    width: 92
  },
  glowRingOuter: {
    borderColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 58,
    borderWidth: 1,
    height: 106,
    left: -15,
    position: "absolute",
    top: -15,
    width: 106
  },
  mark: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 76,
    justifyContent: "center",
    width: 76,
    zIndex: 1
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700"
  },
  wrap: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    minHeight: 190,
    padding: 18,
    position: "relative",
    width: "100%"
  }
});
