import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { FadeInView } from "@/components/animated/FadeInView";
import { getCompanyName, getStockCategoryLabel } from "@/modules/accounting/constants";
import { formatMoney, loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { colors } from "@/theme";

export default function PurchaseDetailScreen() {
  const { id } = useLocalSearchParams();
  const [purchase, setPurchase] = useState(null);

  useEffect(() => {
    loadAccountingState().then((state) => {
      setPurchase(state.purchases.find((record) => record.id === id) || null);
    });
  }, [id]);

  return (
    <View style={styles.screen}>
      <FadeInView>
        <Card>
          <Text style={styles.title}>{purchase ? purchase.item : `Purchase ${id}`}</Text>
          <View style={styles.divider} />
          {purchase ? (
            <View style={styles.details}>
              <DetailRow label="Entity" value={getCompanyName(purchase.companyId)} />
              <DetailRow label="Category" value={getStockCategoryLabel(purchase.category)} />
              <DetailRow label="Quantity" value={`${purchase.quantity} ${purchase.unit}`} />
              <DetailRow label="Unit price" value={formatMoney(purchase.unitPrice)} />
              <DetailRow label="Total" value={formatMoney(purchase.total)} tone="success" />
              {purchase.notes ? <DetailRow label="Notes" value={purchase.notes} /> : null}
            </View>
          ) : (
            <Text style={styles.notFound}>Purchase record was not found in local accounting data.</Text>
          )}
        </Card>
      </FadeInView>
    </View>
  );
}

function DetailRow({ label, value, tone = "default" }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === "success" && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  details: { gap: 10 },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 12
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    minWidth: 90
  },
  notFound: {
    color: colors.textMuted,
    marginTop: 8
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    padding: 16
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700"
  },
  value: {
    color: colors.text,
    flex: 1,
    fontVariant: ["tabular-nums"],
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right"
  }
});
