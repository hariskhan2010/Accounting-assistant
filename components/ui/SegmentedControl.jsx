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
            style={[styles.option, compact && styles.optionCompact, active && styles.active]}
          >
            <Text numberOfLines={2} style={[styles.text, compact && styles.textCompact, active && styles.activeText]}>
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
    backgroundColor: "rgba(212, 175, 55, 0.15)"
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
    borderRadius: 8,
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
  text: {
    color: colors.textMuted,
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
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    padding: 3
  },
  wrapCompact: {
    borderRadius: 9,
    padding: 2
  }
});
