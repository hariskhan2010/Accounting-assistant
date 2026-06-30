import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
  Easing
} from "react-native-reanimated";
import { colors } from "@/theme";

const PARTICLES = [
  { x: -30, y: -30, d: 0 },
  { x: 30, y: -30, d: 80 },
  { x: -30, y: 30, d: 160 },
  { x: 30, y: 30, d: 240 },
  { x: 0, y: -40, d: 40 },
  { x: 40, y: 0, d: 120 },
  { x: -40, y: 0, d: 200 },
  { x: 0, y: 40, d: 280 }
];

export function SuccessBurst({ visible = false, onComplete }) {
  const scale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      scale.value = 0;
      checkOpacity.value = 0;
      ringScale.value = 0;
      return;
    }

    scale.value = withSequence(
      withTiming(1.3, { duration: 200, easing: Easing.out(Easing.back(2)) }),
      withSpring(1, { damping: 12, stiffness: 150 })
    );

    checkOpacity.value = withTiming(1, { duration: 150 });

    ringScale.value = withDelay(
      100,
      withSequence(
        withTiming(1.5, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 200 })
      )
    );

    if (onComplete) {
      setTimeout(onComplete, 1200);
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: scale.value }]
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringScale.value > 0 ? withTiming(1 - ringScale.value / 1.5) : 0,
    transform: [{ scale: ringScale.value }]
  }));

  if (!visible) return null;

  return (
    <Animated.View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.ring, ringStyle]} />
      <Animated.View style={[styles.checkCircle, iconStyle]}>
        <Ionicons name="checkmark" size={32} color={colors.background} />
      </Animated.View>
      {PARTICLES.map((p, i) => (
        <Particle key={i} x={p.x} y={p.y} delay={p.d} visible={visible} />
      ))}
    </Animated.View>
  );
}

function Particle({ x, y, delay: particleDelay, visible }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pScale = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      translateX.value = 0;
      translateY.value = 0;
      opacity.value = 0;
      pScale.value = 0;
      return;
    }

    translateX.value = withDelay(
      particleDelay,
      withTiming(x, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    translateY.value = withDelay(
      particleDelay,
      withTiming(y, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
    opacity.value = withDelay(
      particleDelay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 400 })
      )
    );
    pScale.value = withDelay(
      particleDelay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.3, { duration: 400 })
      )
    );
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: pScale.value }
    ]
  }));

  return <Animated.View style={[styles.particle, animStyle]} />;
}

const styles = StyleSheet.create({
  checkCircle: {
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    left: "50%",
    marginLeft: -24,
    marginTop: -24,
    position: "absolute",
    top: "50%",
    width: 48,
    zIndex: 3
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100
  },
  particle: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    height: 6,
    left: "50%",
    marginLeft: -3,
    marginTop: -3,
    position: "absolute",
    top: "50%",
    width: 6,
    zIndex: 2
  },
  ring: {
    borderColor: colors.primary,
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    left: "50%",
    marginLeft: -30,
    marginTop: -30,
    position: "absolute",
    top: "50%",
    width: 60,
    zIndex: 1
  }
});
