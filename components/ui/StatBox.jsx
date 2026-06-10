import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

export function StatBox({ label, value, tone = "default", delay = 0 }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const borderGlow = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 90 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 90 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 90 }));
    borderGlow.value = withDelay(delay + 300, withTiming(1, { duration: 800 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: borderGlow.value * 0.5
  }));

  const accentColor = tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.primary;
  const bgColor = tone === "success" ? "rgba(26, 188, 156, 0.05)" : tone === "danger" ? "rgba(192, 57, 43, 0.05)" : "rgba(212, 175, 55, 0.05)";

  return (
    <Animated.View style={[styles.box, { backgroundColor: bgColor }, containerStyle]}>
      <Animated.View style={[styles.glow, glowStyle, { borderColor: accentColor }]} />
      <View style={styles.topBorder} />
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          tone === "success" && { color: colors.success },
          tone === "danger" && { color: colors.danger },
          tone === "default" && { color: colors.primary }
        ]}
      >
        {value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 92,
    overflow: "hidden",
    padding: 14
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1.5
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  topBorder: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: 2,
    left: 0,
    opacity: 0.3,
    position: "absolute",
    right: 0,
    top: 0
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
