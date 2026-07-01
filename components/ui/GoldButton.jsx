import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "@/theme";

const SPRING_CONFIG = { damping: 20, stiffness: 300 };

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
          variant === "primary" && styles.primary,
          variant === "secondary" && styles.secondary,
          variant === "ghost" && styles.ghost,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.text, variant === "primary" && styles.primaryText, variant === "ghost" && styles.ghostText]}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 14,
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
    borderWidth: 1
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
  pressed: {
    opacity: 0.85
  },
  text: {
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
