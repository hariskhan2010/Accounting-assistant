import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

function SingleSparkle({ size, delay: sparkleDelay, x, y }) {
  const opacity = useSharedValue(0);
  const scaleVal = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      sparkleDelay,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        true
      )
    );
    scaleVal.value = withDelay(
      sparkleDelay,
      withRepeat(
        withSequence(
          withTiming(1.5, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scaleVal.value }]
  }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left: x, top: y, height: size, width: size },
        animStyle
      ]}
    />
  );
}

export function GoldSparkle({ size = 100, delay = 0, style }) {
  const sparkles = [
    { x: "10%", y: "20%", s: size * 0.25, d: delay },
    { x: "70%", y: "30%", s: size * 0.2, d: delay + 500 },
    { x: "40%", y: "60%", s: size * 0.22, d: delay + 1000 },
    { x: "80%", y: "70%", s: size * 0.18, d: delay + 1500 },
    { x: "25%", y: "80%", s: size * 0.15, d: delay + 2000 },
    { x: "55%", y: "15%", s: size * 0.2, d: delay + 2500 },
    { x: "65%", y: "50%", s: size * 0.12, d: delay + 3000 }
  ];

  return (
    <Animated.View style={[styles.container, { height: size, width: size }, style]}>
      {sparkles.map((sp, index) => (
        <SingleSparkle key={index} size={sp.s} delay={sp.d} x={sp.x} y={sp.y} />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute"
  },
  sparkle: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    justifyContent: "center",
    opacity: 0,
    position: "absolute"
  }
});
