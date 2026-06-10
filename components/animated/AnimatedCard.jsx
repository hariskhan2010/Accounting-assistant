import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withRepeat
} from "react-native-reanimated";
import { colors } from "@/theme";

export function AnimatedCard({ children, delay = 0, style }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.93);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 90 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 90 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 90 }));
    glowOpacity.value = withDelay(delay + 300, withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.25,
    borderColor: colors.primary
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <View style={styles.inner}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden"
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1
  },
  inner: {
    gap: 12,
    padding: 16,
    zIndex: 1
  }
});
