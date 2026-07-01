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

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const accentColor = tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.primary;

  return (
    <Animated.View style={[styles.box, containerStyle]}>
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
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14
  },
  accentBar: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    height: 2,
    left: 0,
    opacity: 0.5,
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
    marginBottom: 6,
    textTransform: "uppercase"
  },
  value: {
    color: colors.text,
    fontFamily: "Montserrat",
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
