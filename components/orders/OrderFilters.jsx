import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors } from "@/theme";

const filters = [
  { key: "all", label: "All" },
  { key: "ebay", label: "eBay" },
  { key: "etsy", label: "Etsy" },
  { key: "pending", label: "Pending" },
  { key: "shipped", label: "Shipped" }
];

export function OrderFilters({ active, onChange }) {
  return (
    <View style={styles.row}>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <Pressable
            key={f.key}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onChange(f.key)}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  chipTextActive: {
    color: colors.background,
    fontWeight: "700"
  }
});
