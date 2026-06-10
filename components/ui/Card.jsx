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

export function Card({ children, style, glowColor = colors.glowGold, delay = 0 }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 80 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 80 }));
    glowOpacity.value = withDelay(delay + 200, withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      true
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value * 0.3
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle, style]}>
      <Animated.View style={[styles.glow, glowStyle, { borderColor: colors.primary }]} />
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
    padding: 16,
    zIndex: 1
  }
});
