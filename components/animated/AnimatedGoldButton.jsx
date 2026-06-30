import { useCallback, useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme";

const SPRING_CONFIG = { damping: 20, stiffness: 300 };

export function AnimatedGoldButton({ title, icon, onPress, disabled, style, delay = 0, variant = "primary" }) {
  const appearOpacity = useSharedValue(0);
  const appearScale = useSharedValue(0.9);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    appearOpacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    appearScale.value = withDelay(delay, withSpring(1, { damping: 20, stiffness: 90 }));
  }, []);

  const handlePressIn = useCallback(() => {
    pressScale.value = withSpring(0.97, SPRING_CONFIG);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const handlePressOut = useCallback(() => {
    pressScale.value = withSpring(1, SPRING_CONFIG);
  }, []);

  const appearStyle = useAnimatedStyle(() => ({
    opacity: appearOpacity.value,
    transform: [{ scale: appearScale.value * pressScale.value }]
  }));

  const isPrimary = variant === "primary";

  return (
    <Animated.View style={appearStyle}>
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
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "700",
    zIndex: 1
  },
  primaryText: {
    color: "#020203",
    fontWeight: "800"
  },
  ghostText: {
    color: colors.primary
  }
});
