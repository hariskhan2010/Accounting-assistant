import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { colors } from "@/theme";

export function StockChart() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    (async () => {
      const state = await loadAccountingState();
      setSales(state.sales || []);
      setPurchases(state.purchases || []);
    })();
  }, []);

  const stats = useMemo(() => {
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.quantity || 0), 0);
    const totalSales = sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
    const categories = [...new Set([...purchases.map((p) => p.category || "raw"), ...sales.map((s) => s.category || "polished")])];
    return { totalPurchases, totalSales, categories, balance: totalPurchases - totalSales };
  }, [purchases, sales]);

  const hasData = stats.totalPurchases > 0 || stats.totalSales > 0;

  if (!hasData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No stock data</Text>
        <Text style={styles.text}>Purchase and sale records will populate this chart.</Text>
      </View>
    );
  }

  const maxVal = Math.max(stats.totalPurchases, stats.totalSales, 1);

  return (
    <View style={styles.container}>
      <View style={styles.barRow}>
        <View style={styles.barLabel}>
          <Text style={styles.label}>In</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.bar, { width: `${(stats.totalPurchases / maxVal) * 100}%`, backgroundColor: colors.success }]} />
        </View>
        <Text style={styles.count}>{stats.totalPurchases}</Text>
      </View>
      <View style={styles.barRow}>
        <View style={styles.barLabel}>
          <Text style={styles.label}>Out</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.bar, { width: `${(stats.totalSales / maxVal) * 100}%`, backgroundColor: colors.danger }]} />
        </View>
        <Text style={styles.count}>{stats.totalSales}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={[styles.balanceValue, stats.balance >= 0 ? { color: colors.success } : { color: colors.danger }]}>
          {stats.balance >= 0 ? "+" : ""}{stats.balance}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  balanceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 4
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "800"
  },
  bar: {
    borderRadius: 6,
    height: "100%"
  },
  barLabel: {
    minWidth: 44
  },
  barRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10
  },
  container: {
    gap: 4,
    paddingVertical: 8
  },
  count: {
    color: colors.text,
    fontVariant: ["tabular-nums"],
    fontSize: 14,
    fontWeight: "700",
    minWidth: 50,
    textAlign: "right"
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 8
  },
  empty: {
    alignItems: "center",
    padding: 24
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  text: {
    color: colors.textMuted,
    textAlign: "center"
  },
  track: {
    backgroundColor: colors.background,
    borderRadius: 6,
    flex: 1,
    height: 24,
    overflow: "hidden"
  }
});
