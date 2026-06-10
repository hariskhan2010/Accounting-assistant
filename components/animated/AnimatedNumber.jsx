import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

const AnimatedText = Animated.createAnimatedComponent(Text);

function formatValue(value) {
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function AnimatedNumber({ value, duration = 800, style }) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration });
  }, [value]);

  const animatedProps = useAnimatedProps(() => ({
    text: formatValue(Math.round(animatedValue.value))
  }));

  return (
    <AnimatedText animatedProps={animatedProps} style={[styles.text, style]} />
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    fontWeight: "700"
  }
});
