import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme";

const SPRING_CONFIG = { damping: 20, stiffness: 300 };
const EASING = [0.16, 1, 0.3, 1];

export function GoldButton({ title, icon, onPress, disabled, style, variant = "primary" }) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, SPRING_CONFIG);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const isPrimary = variant === "primary";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          isPrimary ? styles.primary : styles.secondary,
          variant === "ghost" && styles.ghost,
          disabled && styles.disabled,
          pressed && !disabled && isPrimary && styles.primaryPressed,
          pressed && !disabled && !isPrimary && styles.secondaryPressed,
          style
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.text, isPrimary && styles.primaryText, variant === "ghost" && styles.ghostText]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 20
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 0
  },
  disabled: {
    opacity: 0.35
  },
  icon: {
    zIndex: 1
  },
  primaryPressed: {
    backgroundColor: colors.primaryDark
  },
  secondaryPressed: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.glowGold
  },
  text: {
    fontSize: 15,
    fontWeight: "700",
    zIndex: 1
  },
  primaryText: {
    color: colors.background
  },
  ghostText: {
    color: colors.primary
  }
});
