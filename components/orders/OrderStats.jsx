import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

const statConfig = [
  { key: "total", label: "Total", icon: "cube-outline", color: colors.primary },
  { key: "pending", label: "Pending", icon: "time-outline", color: colors.warning },
  { key: "shipped", label: "Shipped", icon: "send-outline", color: colors.primary },
  { key: "revenue", label: "Revenue", icon: "cash-outline", color: colors.success }
];

export function OrderStats({ stats }) {
  return (
    <View style={styles.row}>
      {statConfig.map((s) => (
        <View key={s.key} style={styles.statBox}>
          <Ionicons name={s.icon} size={18} color={s.color} />
          <Text style={[styles.value, { color: s.color }]}>
            {s.key === "revenue" ? `$${Number(stats?.[s.key] || 0).toFixed(0)}` : stats?.[s.key] ?? 0}
          </Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8
  },
  statBox: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingVertical: 12
  },
  value: {
    fontSize: 18,
    fontWeight: "800"
  },
  label: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase"
  }
});
