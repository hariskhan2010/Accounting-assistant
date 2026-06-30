import { useEffect, useId, useState } from "react";
import { StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { colors } from "@/theme";

export function LuxuryTextInput({ label, error, helperText, style, ...props }) {
  const [focused, setFocused] = useState(false);
  const id = useId();

  return (
    <View style={styles.container}>
      {label ? <Text nativeID={`label-${id}`} style={[styles.label, focused && styles.labelFocused]}>{label}</Text> : null}
      <Animated.View
        style={[
          styles.wrapper,
          focused && styles.wrapperFocused,
          error && styles.wrapperError
        ]}
      >
        <RNTextInput
          aria-labelledby={label ? `label-${id}` : undefined}
          aria-invalid={error ? true : undefined}
          placeholderTextColor={colors.textDim}
          style={[styles.input, style]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </Animated.View>
      {error ? (
        <Text style={styles.errorText} role="alert">{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6
  },
  errorText: {
    color: colors.danger,
    fontFamily: "Montserrat",
    fontSize: 12
  },
  helper: {
    color: colors.textDim,
    fontFamily: "Montserrat",
    fontSize: 12
  },
  input: {
    color: colors.text,
    fontFamily: "Montserrat",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    zIndex: 1
  },
  label: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5
  },
  labelFocused: {
    color: colors.primary
  },
  wrapper: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    overflow: "hidden"
  },
  wrapperError: {
    borderColor: colors.danger,
    borderWidth: 1
  },
  wrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5
  }
});
