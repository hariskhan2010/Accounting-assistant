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
    borderWidth: 1,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#D4AF37",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 14
      },
      android: {
        elevation: 6
      }
    })
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderLight,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16
      },
      android: {
        elevation: 8
      }
    })
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.borderLight,
    borderWidth: 1
  },
  inner: {
    padding: 20,
    zIndex: 1
  }
});
