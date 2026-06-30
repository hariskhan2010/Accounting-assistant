import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { LazyGemScene } from "@/components/gemstone/LazyGemScene";
import { colors } from "@/theme";

function AnimatedText({ children, delay = 0, style }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 700 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 100 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }]
  }));

  return <Animated.Text style={[animatedStyle, style]}>{children}</Animated.Text>;
}

export function LuxuryScreenHeader({ title, subtitle, sceneHeight = 118, colorIndex = 0 }) {
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const resolvedSceneHeight = compact ? Math.min(sceneHeight, 88) : sceneHeight;

  return (
    <View style={styles.wrap}>
      <LazyGemScene colorIndex={colorIndex} height={resolvedSceneHeight} scale={compact ? 0.44 : 0.55} speed={0.45} />
      <View style={[styles.copy, compact && styles.copyCompact]}>
        <AnimatedText delay={200} style={[styles.title, compact && styles.titleCompact]}>
          {title}
        </AnimatedText>
        {subtitle ? (
          <AnimatedText delay={350} style={[styles.subtitle, compact && styles.subtitleCompact]}>
            {subtitle}
          </AnimatedText>
        ) : null}
      </View>
      <View style={styles.goldDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  copyCompact: {
    paddingHorizontal: 14,
    paddingVertical: 11
  },
  goldDivider: {
    backgroundColor: colors.primary,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    opacity: 0.4
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.3
  },
  subtitleCompact: {
    fontSize: 13
  },
  title: {
    color: colors.text,
    fontFamily: "Cormorant",
    fontSize: 28,
    fontWeight: "700"
  },
  titleCompact: {
    fontSize: 24
  },
  wrap: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden"
  }
});
