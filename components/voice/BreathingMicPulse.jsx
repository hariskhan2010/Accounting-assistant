import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

function PulseRing({ index, total }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);
  const baseDelay = index * 800;

  useEffect(() => {
    scale.value = withDelay(
      baseDelay,
      withRepeat(
        withSequence(
          withTiming(1.8, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    opacity.value = withDelay(
      baseDelay,
      withRepeat(
        withSequence(
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.3, { duration: 2400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          borderColor: colors.primary,
          width: 64 + index * 28,
          height: 64 + index * 28,
          borderRadius: (64 + index * 28) / 2,
          marginLeft: -(64 + index * 28) / 2,
          marginTop: -(64 + index * 28) / 2
        },
        animStyle
      ]}
    />
  );
}

function BreathingGlow() {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[
        styles.glow,
        {
          width: 60,
          height: 60,
          borderRadius: 30,
          marginLeft: -30,
          marginTop: -30
        },
        animStyle
      ]}
    />
  );
}

export function BreathingMicPulse({ size = 48, active = true }) {
  return (
    <View style={[styles.container, { width: size + 40, height: size + 40 }]}>
      {active && (
        <>
          <BreathingGlow />
          {[0, 1, 2].map((i) => (
            <PulseRing key={i} index={i} total={3} />
          ))}
        </>
      )}
      <View style={[styles.micCircle, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="mic" size={size * 0.45} color={colors.background} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  glow: {
    backgroundColor: colors.glowGold,
    position: "absolute"
  },
  micCircle: {
    alignItems: "center",
    backgroundColor: colors.primary,
    justifyContent: "center",
    zIndex: 2
  },
  ring: {
    borderWidth: StyleSheet.hairlineWidth,
    position: "absolute"
  }
});
