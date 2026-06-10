import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withRepeat
} from "react-native-reanimated";
import { colors } from "@/theme";

export function AnimatedStatBox({ label, value, tone = "default", delay = 0 }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const borderGlow = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 85 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 85 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 85 }));
    borderGlow.value = withDelay(delay + 400, withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    ));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: borderGlow.value * 0.4
  }));

  const accentColor = tone === "success" ? colors.successLight : tone === "danger" ? colors.dangerLight : colors.primaryLight;

  return (
    <Animated.View style={[styles.box, containerStyle]}>
      <Animated.View style={[styles.glow, glowStyle, { borderColor: accentColor }]} />
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
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
  accentBar: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: 2.5,
    left: 0,
    opacity: 0.5,
    position: "absolute",
    right: 0,
    top: 0
  },
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
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  value: {
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
