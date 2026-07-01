import { useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { AnimatedCounter } from "@/components/animated/AnimatedCounter";
import { colors } from "@/theme";

const SPRING_CONFIG = { damping: 20, stiffness: 90 };

export function AnimatedStatBox({ label, value, tone = "default", delay = 0, onPress, showArrow = false }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.95);

  const accentColor = tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.primary;
  const valueColor = tone === "success" ? colors.success : tone === "danger" ? colors.danger : colors.primary;

  const handlePress = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  }, [onPress]);

  const content = (
    <>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        {showArrow ? (
          <Ionicons name="chevron-forward" size={14} color={colors.textDim} />
        ) : null}
      </View>
      <AnimatedCounter value={value} tone={tone} />
    </>
  );

  return (
    <Animated.View style={[styles.box, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
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
  box: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth
  },
  label: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    flex: 1,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  pressable: {
    padding: 14
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 6
  }
});
