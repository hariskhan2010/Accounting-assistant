import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing
} from "react-native-reanimated";
import { colors } from "@/theme";

export function GoldShimmerBorder({ children, active = true, style }) {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    if (!active) return;
    translateX.value = withRepeat(
      withTiming(400, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [active]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <View style={[styles.container, style]}>
      {active && (
        <View style={styles.borderTrack}>
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  borderTrack: {
    borderRadius: 17,
    bottom: -1,
    height: "102%",
    left: -1,
    overflow: "hidden",
    position: "absolute",
    right: -1,
    top: -1,
    width: "102%"
  },
  container: {
    borderRadius: 16,
    position: "relative"
  },
  content: {
    borderRadius: 16,
    zIndex: 1
  },
  shimmer: {
    backgroundColor: colors.primary,
    height: "100%",
    opacity: 0.15,
    transform: [{ skewX: "-20deg" }],
    width: 80
  }
});
