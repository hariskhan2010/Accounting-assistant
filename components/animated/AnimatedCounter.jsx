import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing
} from "react-native-reanimated";
import { colors } from "@/theme";

const formatValue = (val) => {
  if (val == null || isNaN(val)) return "—";
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]/g, "")) : val;
  if (isNaN(num)) return "—";
  return Math.round(num).toLocaleString("en-PK");
};

export function AnimatedCounter({ value, style, tone = "default", prefix = "", suffix = "" }) {
  const [display, setDisplay] = useState("0");
  const animVal = useSharedValue(0);

  const numericTarget = (() => {
    if (value == null || isNaN(value)) return 0;
    const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;
    return isNaN(num) ? 0 : num;
  })();

  useEffect(() => {
    animVal.value = withTiming(numericTarget, {
      duration: 1200,
      easing: Easing.out(Easing.cubic)
    });
  }, [numericTarget]);

  useAnimatedReaction(
    () => animVal.value,
    (current) => {
      runOnJS(setDisplay)(formatValue(Math.round(current)));
    }
  );

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(numericTarget > 0 ? 1 : 0.95, { damping: 15, stiffness: 100 }) }]
  }));

  return (
    <Animated.Text
      style={[
        styles.value,
        tone === "success" && { color: colors.success },
        tone === "danger" && { color: colors.danger },
        tone === "default" && { color: colors.primary },
        style
      ]}
    >
      {prefix}{display}{suffix}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  value: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
