import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors } from "@/theme";

export function SegmentedControl({ options, value, onChange }) {
  const { width } = useWindowDimensions();
  const compact = width < 390;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      {options.map((option) => {
        const active = option.id === value || option.key === value;
        const optionValue = option.id ?? option.key;

        return (
          <Pressable
            key={optionValue}
            onPress={() => onChange(optionValue)}
            style={({ pressed }) => [
              styles.option,
              compact && styles.optionCompact,
              active && styles.active,
              pressed && !active && styles.optionPressed
            ]}
          >
            <Text
              numberOfLines={2}
              style={[
                styles.text,
                compact && styles.textCompact,
                active && styles.activeText
              ]}
            >
              {option.name || option.label}
            </Text>
            {active && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  active: {
    backgroundColor: colors.glowGold
  },
  activeDot: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    bottom: 4,
    height: 3,
    left: "25%",
    position: "absolute",
    right: "25%"
  },
  activeText: {
    color: colors.primary,
    fontWeight: "800"
  },
  option: {
    alignItems: "center",
    borderRadius: 10,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: "center",
    minHeight: 40,
    minWidth: 88,
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: "relative"
  },
  optionCompact: {
    minHeight: 38,
    minWidth: 72,
    paddingHorizontal: 6,
    paddingVertical: 7
  },
  optionPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.04)"
  },
  text: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center"
  },
  textCompact: {
    fontSize: 11
  },
  wrap: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    padding: 3
  },
  wrapCompact: {
    borderRadius: 10,
    padding: 2
  }
});
