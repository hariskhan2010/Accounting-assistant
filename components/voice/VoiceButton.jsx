import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

export function VoiceButton({ active, onPress, onPressIn, onPressOut }) {
  const pulse = useSharedValue(1);
  const ring = useSharedValue(0);

  useEffect(() => {
    if (active) {
      pulse.value = withRepeat(
        withSpring(1.08, { damping: 4, stiffness: 80 }),
        -1,
        true
      );
      ring.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        false
      );
    } else {
      pulse.value = withSpring(1);
      ring.value = withTiming(0);
    }
  }, [active]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }]
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value * 0.4,
    transform: [{ scale: 1 + ring.value * 0.3 }]
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      accessibilityLabel={active ? "Press and hold to record" : "Press and hold to record"}
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.wrapper, { userSelect: "none", WebkitUserSelect: "none", touchAction: "manipulation" }]}
    >
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ringSecondary, ringStyle]} pointerEvents="none" />
      <Animated.View style={[styles.innerBtn, active && styles.active, pulseStyle]}>
        <Ionicons
          name={active ? "stop" : "mic"}
          size={20}
          color={colors.background}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: colors.danger
  },
  innerBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44,
    zIndex: 2
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.primary,
    borderRadius: 26,
    borderWidth: 2,
    height: 52,
    left: -4,
    position: "absolute",
    top: -4,
    width: 52,
    zIndex: 1
  },
  ringSecondary: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.secondary,
    borderRadius: 30,
    borderWidth: 1.5,
    height: 60,
    left: -8,
    position: "absolute",
    top: -8,
    width: 60,
    zIndex: 0
  },
  wrapper: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44
  }
});
