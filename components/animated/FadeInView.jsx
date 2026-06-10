import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring
} from "react-native-reanimated";

export function FadeInView({ children, delay = 0, direction = "up", duration = 500, style }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === "up" ? 30 : direction === "down" ? -30 : 0);
  const translateX = useSharedValue(direction === "left" ? 30 : direction === "right" ? -30 : 0);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 100, mass: 0.7 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 100 }));
    translateX.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 100 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }]
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
