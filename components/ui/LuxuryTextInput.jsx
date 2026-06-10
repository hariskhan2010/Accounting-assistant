import { useEffect, useState } from "react";
import { StyleSheet, TextInput as RNTextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

export function LuxuryTextInput({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  const borderOpacity = useSharedValue(0);

  useEffect(() => {
    borderOpacity.value = withTiming(focused ? 1 : 0, { duration: 300 });
  }, [focused]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: focused
      ? colors.primary
      : colors.border,
    opacity: focused ? 1 : 0.6
  }));

  return (
    <Animated.View style={[styles.wrapper, borderStyle]}>
      <RNTextInput
        placeholderTextColor={colors.textDim}
        style={[styles.input, style]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {focused && <View style={styles.focusLine} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  focusLine: {
    backgroundColor: colors.primary,
    bottom: 0,
    height: 2,
    left: "10%",
    position: "absolute",
    right: "10%"
  },
  input: {
    color: colors.text,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: 12,
    zIndex: 1
  },
  wrapper: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: "center",
    overflow: "hidden"
  }
});
