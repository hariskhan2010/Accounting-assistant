import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
  withRepeat
} from "react-native-reanimated";
import { colors } from "@/theme";

export function AnimatedGoldButton({ title, icon, onPress, disabled, style, delay = 0, variant = "primary" }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const shimmer = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 16, stiffness: 100 }));
    shimmer.value = withDelay(delay + 500, withRepeat(
      withSequence(
        withTiming(1, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      true
    ));
  }, []);

  const appearStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value * pressScale.value }]
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value * 0.12,
    transform: [{ translateX: shimmer.value * 250 }]
  }));

  const isPrimary = variant === "primary";

  return (
    <Animated.View style={appearStyle}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={() => { pressScale.value = withSpring(0.96); }}
        onPressOut={() => { pressScale.value = withSpring(1); }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          isPrimary ? styles.primary : styles.secondary,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
          style
        ]}
      >
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.text, !isPrimary && styles.secondaryText]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    overflow: "hidden",
    paddingHorizontal: 16
  },
  disabled: {
    opacity: 0.4
  },
  icon: {
    marginTop: 1,
    zIndex: 1
  },
  pressed: {
    opacity: 0.9
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  secondaryText: {
    color: colors.primary
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryLight,
    width: 100,
    transform: [{ skewX: "-25deg" }]
  },
  text: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "800",
    zIndex: 1
  }
});
