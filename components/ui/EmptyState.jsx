import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";

const ICON_MAP = {
  orders: { name: "cube-outline", library: "ion" },
  barcodes: { name: "barcode-outline", library: "ion" },
  stock: { name: "layers-outline", library: "ion" },
  sales: { name: "receipt-outline", library: "ion" },
  purchases: { name: "cart-outline", library: "ion" },
  expenses: { name: "wallet-outline", library: "ion" },
  reports: { name: "bar-chart-outline", library: "ion" },
  staff: { name: "people-outline", library: "ion" },
  minerals: { name: "diamond-outline", library: "ion" },
  salary: { name: "cash-outline", library: "ion" },
  profit: { name: "trending-up-outline", library: "ion" },
  default: { name: "document-text-outline", library: "ion" }
};

export function EmptyState({ icon = "default", title, subtitle, style }) {
  const iconDef = ICON_MAP[icon] || ICON_MAP.default;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name={iconDef.name} size={28} color={colors.textDim} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 40
  },
  iconCircle: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    justifyContent: "center",
    marginBottom: 4,
    width: 56
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center"
  },
  title: {
    color: colors.textMuted,
    fontFamily: "Cormorant",
    fontSize: 18,
    fontWeight: "600"
  }
});
