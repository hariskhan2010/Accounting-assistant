import { useCallback } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { useReplayOnFocus } from "@/hooks/useReplayOnFocus";

const SPRING_CONFIG = { damping: 20, stiffness: 90 };

export function FadeInView({ children, delay = 0, direction = "up", duration = 500, style }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === "up" ? 30 : direction === "down" ? -30 : 0);
  const translateX = useSharedValue(direction === "left" ? 30 : direction === "right" ? -30 : 0);

  useReplayOnFocus(useCallback(() => {
    opacity.value = 0;
    translateY.value = direction === "up" ? 30 : direction === "down" ? -30 : 0;
    translateX.value = direction === "left" ? 30 : direction === "right" ? -30 : 0;
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
    translateX.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
  }, [delay, direction, duration, opacity, translateX, translateY]));

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }]
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
