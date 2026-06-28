import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Barcode128 } from "@/components/ui/Barcode128";
import { colors } from "@/theme";

const platformMeta = {
  ebay: { label: "eBay", color: "#E53238", icon: "logo-usd" },
  etsy: { label: "Etsy", color: "#F1641E", icon: "storefront" }
};

function formatAddress(addr) {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  const parts = [
    addr.addressLine1 || addr.line1 || addr.street || "",
    addr.addressLine2 || addr.line2 || "",
    addr.city || "",
    addr.state || addr.province || "",
    addr.postalCode || addr.zip || "",
    addr.country || ""
  ].filter(Boolean);
  return parts.join(", ");
}

export function OrderCard({ order, onMarkShipped, onPrintLabel }) {
  const platform = platformMeta[order.platform] || platformMeta.ebay;
  const formattedAddress = formatAddress(order.shippingAddress);

  return (
    <View style={styles.card}>
      <View style={styles.barcodeSection}>
        <Barcode128 value={order.stockId || order.id} width={260} height={50} />
      </View>

      <View style={styles.platformRow}>
        <View style={[styles.platformBadge, { backgroundColor: platform.color }]}>
          <Text style={styles.platformText}>{platform.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{order.customerName || "—"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{order.customerEmail || "—"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{order.customerPhone || "—"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={[styles.detailText, styles.addressText]} numberOfLines={3}>
            {formattedAddress || "—"}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Order Amount:</Text>
        <Text style={styles.amountValue}>
          {order.currency || "$"}{Number(order.orderAmount || 0).toFixed(2)}
        </Text>
      </View>

      <View style={styles.actions}>
        {order.status === "pending" && (
          <Pressable style={styles.shipButton} onPress={() => onMarkShipped?.(order.id)}>
            <Ionicons name="checkmark-circle" size={16} color={colors.background} />
            <Text style={styles.shipButtonText}>Mark Shipped</Text>
          </Pressable>
        )}
        <Pressable style={styles.printButton} onPress={() => onPrintLabel?.(order)}>
          <Ionicons name="print-outline" size={16} color={colors.primary} />
          <Text style={styles.printButtonText}>Print Label</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    gap: 10,
    overflow: "hidden",
    padding: 14
  },
  barcodeSection: {
    alignItems: "center"
  },
  platformRow: {
    alignItems: "flex-start"
  },
  platformBadge: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  platformText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  divider: {
    backgroundColor: colors.borderLight,
    height: 1
  },
  details: {
    gap: 6
  },
  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  detailText: {
    color: colors.text,
    flex: 1,
    fontSize: 13
  },
  addressText: {
    color: colors.textMuted,
    fontSize: 12
  },
  amountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6
  },
  amountLabel: {
    color: colors.textMuted,
    fontSize: 13
  },
  amountValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4
  },
  shipButton: {
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 10
  },
  shipButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: "700"
  },
  printButton: {
    alignItems: "center",
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 10
  },
  printButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700"
  }
});
