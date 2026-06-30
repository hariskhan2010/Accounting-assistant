import { useEffect, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AnimatedCounter } from "@/components/animated/AnimatedCounter";
import { colors } from "@/theme";

const SPRING_CONFIG = { damping: 20, stiffness: 90 };

export function AnimatedStatBox({ label, value, tone = "default", delay = 0, onPress, showArrow = false, active = false }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, SPRING_CONFIG));
    scale.value = withDelay(delay, withSpring(1, SPRING_CONFIG));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }]
  }));

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [onPress]);

  const accentColor = tone === "success" ? colors.successLight : tone === "danger" ? colors.dangerLight : colors.primaryLight;

  const content = (
    <>
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {showArrow ? (
          <View style={[styles.arrowButton, active && styles.arrowButtonActive]}>
            <Ionicons name={active ? "chevron-up" : "chevron-forward"} size={16} color={active ? colors.background : colors.primary} />
          </View>
        ) : null}
      </View>
      <AnimatedCounter value={value} tone={tone} prefix="" suffix="" />
    </>
  );

  return (
    <Animated.View style={[styles.box, active && styles.boxActive, containerStyle]}>
      {onPress ? (
        <Pressable accessibilityRole="button" onPress={handlePress} style={styles.pressable}>
          {content}
        </Pressable>
      ) : (
        <View style={styles.pressable}>{content}</View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: 2.5,
    left: 0,
    opacity: 0.5,
    position: "absolute",
    right: 0,
    top: 0
  },
  box: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 92,
    overflow: "hidden"
  },
  boxActive: {
    borderColor: colors.primary
  },
  label: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    flex: 1,
    textTransform: "uppercase"
  },
  arrowButton: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  arrowButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  pressable: {
    minHeight: 92,
    padding: 14
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8
  },
  value: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontVariant: ["tabular-nums"],
    fontWeight: "800"
  }
});
