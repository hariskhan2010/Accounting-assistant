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

function SingleSparkle({ size, delay: sparkleDelay, x, y }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      sparkleDelay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      sparkleDelay,
      withRepeat(
        withSequence(
          withTiming(1.4, { duration: 1000 }),
          withTiming(0.3, { duration: 1000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View
      style={[
        styles.sparkle,
        { left: x, top: y, height: size, width: size },
        animatedStyle
      ]}
    >
      <Animated.View style={[styles.inner, { height: size * 0.15, width: size * 0.15 }]} />
    </Animated.View>
  );
}

export function GoldSparkle({ size = 100, delay = 0, style }) {
  const sparkles = [
    { x: "10%", y: "20%", s: size * 0.25, d: delay },
    { x: "70%", y: "30%", s: size * 0.2, d: delay + 400 },
    { x: "40%", y: "60%", s: size * 0.22, d: delay + 800 },
    { x: "80%", y: "70%", s: size * 0.18, d: delay + 1200 },
    { x: "25%", y: "80%", s: size * 0.15, d: delay + 1600 },
    { x: "55%", y: "15%", s: size * 0.2, d: delay + 2000 }
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
  inner: {
    backgroundColor: "#D4AF37",
    borderRadius: 999
  },
  sparkle: {
    alignItems: "center",
    borderColor: "rgba(212, 175, 55, 0.6)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    position: "absolute"
  }
});
