import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { GoldShimmerBorder } from "@/components/animated/GoldShimmerBorder";
import { colors } from "@/theme";

const SPRING_CONFIG = { damping: 20, stiffness: 90 };

export function AnimatedCard({ children, delay = 0, variant = "default", style, shimmer = false }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.93);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const cardInner = (
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

  if (shimmer) {
    return <GoldShimmerBorder active>{cardInner}</GoldShimmerBorder>;
  }

  return cardInner;
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
    gap: 14,
    padding: 20,
    zIndex: 1
  }
});
