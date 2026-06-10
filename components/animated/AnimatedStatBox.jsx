import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withRepeat
} from "react-native-reanimated";
import { colors } from "@/theme";

export function AnimatedStatBox({ label, value, tone = "default", delay = 0, onPress, showArrow = false, active = false }) {
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

  const content = (
    <>
      <Animated.View style={[styles.glow, glowStyle, { borderColor: accentColor }]} />
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {showArrow ? (
          <View style={[styles.arrowButton, active && styles.arrowButtonActive]}>
            <Ionicons name={active ? "chevron-up" : "chevron-forward"} size={16} color={active ? colors.background : colors.primary} />
          </View>
        ) : null}
      </View>
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
    </>
  );

  return (
    <Animated.View style={[styles.box, active && styles.boxActive, containerStyle]}>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.pressable}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.pressable}>{content}</View>
      )}
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
  },
  boxActive: {
    borderColor: colors.primary
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
    flex: 1,
    textTransform: "uppercase"
  },
  arrowButton: {
    alignItems: "center",
    borderColor: colors.borderLight,
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  arrowButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  pressable: {
    minHeight: 92,
    padding: 14
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8
  },
  value: {
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
