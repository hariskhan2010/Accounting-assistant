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

export function VoiceButton({ active, onPress }) {
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
      accessibilityLabel={active ? "Stop recording" : "Start recording"}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.wrapper}
    >
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <Animated.View style={[styles.ringSecondary, ringStyle]} pointerEvents="none" />
      <Animated.View style={[styles.innerBtn, active && styles.active, pulseStyle]}>
        <Ionicons
          name={active ? "stop" : "mic"}
          size={30}
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
    borderRadius: 40,
    height: 72,
    justifyContent: "center",
    width: 72,
    zIndex: 2
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.primary,
    borderRadius: 44,
    borderWidth: 2,
    height: 88,
    left: -8,
    position: "absolute",
    top: -8,
    width: 88,
    zIndex: 1
  },
  ringSecondary: {
    ...StyleSheet.absoluteFillObject,
    borderColor: colors.secondary,
    borderRadius: 50,
    borderWidth: 1.5,
    height: 100,
    left: -14,
    position: "absolute",
    top: -14,
    width: 100,
    zIndex: 0
  },
  wrapper: {
    alignItems: "center",
    height: 100,
    justifyContent: "center",
    width: 100
  }
});
