import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { getCompanyName } from "@/modules/accounting/constants";
import { formatMoney, loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { exportInvoicePdf } from "@/modules/reports/pdfExport";
import { colors } from "@/theme";

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    loadAccountingState().then((state) => {
      setSale(state.sales.find((record) => record.id === id) || null);
    });
  }, [id]);

  const exportInvoice = async () => {
    if (!sale) return;

    try {
      const result = await exportInvoicePdf(sale);
      Alert.alert("Invoice created", result.uri);
    } catch (error) {
      Alert.alert("Invoice failed", error.message);
    }
  };

  return (
    <View style={styles.screen}>
      <FadeInView>
        <Card>
          <Text style={styles.title}>{sale ? `Invoice ${sale.invoiceNo}` : `Sale ${id}`}</Text>
          <View style={styles.divider} />
          {sale ? (
            <View style={styles.details}>
              <DetailRow label="Entity" value={getCompanyName(sale.companyId)} />
              <DetailRow label="Buyer" value={sale.buyer} />
              <DetailRow label="Item" value={sale.item} />
              <DetailRow label="Quantity" value={`${sale.quantity} ${sale.unit}`} />
              <DetailRow label="Total" value={formatMoney(sale.total)} tone="success" />
              <AnimatedGoldButton style={styles.button} title="Create Invoice PDF" onPress={exportInvoice} />
            </View>
          ) : (
            <Text style={styles.notFound}>Sale record was not found in local accounting data.</Text>
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
  button: {
    marginTop: 16
  },
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
