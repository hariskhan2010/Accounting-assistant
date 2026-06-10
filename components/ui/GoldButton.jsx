import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  withRepeat
} from "react-native-reanimated";
import { colors } from "@/theme";

export function GoldButton({ title, icon, onPress, disabled, style, variant = "primary" }) {
  const scale = useSharedValue(1);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value * 0.15,
    transform: [{ translateX: shimmer.value * 200 }]
  }));

  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
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
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 10,
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
    width: 80,
    transform: [{ skewX: "-20deg" }]
  },
  text: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "700",
    zIndex: 1
  }
});
