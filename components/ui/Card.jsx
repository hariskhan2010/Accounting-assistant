import { useEffect } from "react";
import { StyleSheet, View, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

export function Card({ children, style, variant = "default", delay = 0 }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 20, stiffness: 90 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        variant === "elevated" && styles.elevated,
        variant === "outline" && styles.outline,
        animatedStyle,
        style
      ]}
    >
      <View style={styles.inner}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    overflow: "hidden"
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12
      },
      android: {
        elevation: 4
      }
    })
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.borderLight,
    borderWidth: 1
  },
  inner: {
    padding: 16,
    zIndex: 1
  }
});
