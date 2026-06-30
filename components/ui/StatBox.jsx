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

const SPRING_CONFIG = { damping: 20, stiffness: 90 };

export function StatBox({ label, value, tone = "default", delay = 0 }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const accentColor = tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.primary;
  const bgColor = tone === "success" ? "rgba(26, 188, 156, 0.05)" : tone === "danger" ? "rgba(192, 57, 43, 0.05)" : "rgba(212, 175, 55, 0.03)";

  return (
    <Animated.View style={[styles.box, { backgroundColor: bgColor }, containerStyle]}>
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
  box: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 92,
    overflow: "hidden",
    padding: 14
  },
  accentBar: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 2.5,
    left: 0,
    opacity: 0.4,
    position: "absolute",
    right: 0,
    top: 0
  },
  label: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  value: {
    color: colors.text,
    fontFamily: "Montserrat",
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
