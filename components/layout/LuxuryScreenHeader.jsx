import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

function AnimatedText({ children, delay = 0, style }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 100 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return <Animated.Text style={[animatedStyle, style]}>{children}</Animated.Text>;
}

export function LuxuryScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        <AnimatedText delay={200} style={styles.title}>{title}</AnimatedText>
        {subtitle ? (
          <AnimatedText delay={350} style={styles.subtitle}>{subtitle}</AnimatedText>
        ) : null}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  divider: {
    backgroundColor: colors.success,
    height: 1,
    marginHorizontal: 20,
    opacity: 0.3
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.3
  },
  title: {
    color: colors.text,
    fontFamily: "Cormorant",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden"
  }
});
