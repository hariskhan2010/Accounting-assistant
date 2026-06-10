import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { colors } from "@/theme";

export function ProfitChart() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    (async () => {
      const state = await loadAccountingState();
      setSales(state.sales || []);
      setPurchases(state.purchases || []);
      setExpenses(state.expenses || []);
    })();
  }, []);

  const totals = useMemo(() => {
    const totalSales = sales.reduce((sum, s) => sum + Number(s.total || 0), 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const grossProfit = totalSales - totalPurchases;
    const netProfit = grossProfit - totalExpenses;
    return { totalSales, totalPurchases, totalExpenses, grossProfit, netProfit };
  }, [sales, purchases, expenses]);

  const hasData = totals.totalSales > 0 || totals.totalPurchases > 0;

  if (!hasData) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No data yet</Text>
        <Text style={styles.text}>Revenue, purchase, and expense data will appear here.</Text>
      </View>
    );
  }

  const maxVal = Math.max(totals.totalSales, totals.totalPurchases, totals.totalExpenses, totals.grossProfit, 1);

  const items = [
    { label: "Sales", value: totals.totalSales, color: colors.success },
    { label: "Purchases", value: totals.totalPurchases, color: colors.primary },
    { label: "Expenses", value: totals.totalExpenses, color: colors.danger },
    { label: "Gross Profit", value: totals.grossProfit, color: totals.grossProfit >= 0 ? colors.success : colors.danger },
    { label: "Net Profit", value: totals.netProfit, color: totals.netProfit >= 0 ? colors.success : colors.danger }
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View key={item.label} style={styles.row}>
          <Text style={styles.label}>{item.label}</Text>
          <View style={styles.track}>
            <View
              style={[
                styles.bar,
                {
                  width: `${Math.max((Math.abs(item.value) / maxVal) * 100, 2)}%`,
                  backgroundColor: item.color
                }
              ]}
            />
          </View>
          <Text style={[styles.value, { color: item.color }]}>
            Rs {Math.round(item.value).toLocaleString("en-PK")}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: 6,
    height: "100%"
  },
  container: {
    gap: 10,
    paddingVertical: 8
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
    minWidth: 100,
    textTransform: "uppercase"
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  text: {
    color: colors.textMuted,
    textAlign: "center"
  },
  track: {
    backgroundColor: colors.background,
    borderRadius: 6,
    flex: 1,
    height: 20,
    overflow: "hidden"
  },
  value: {
    fontVariant: ["tabular-nums"],
    fontSize: 12,
    fontWeight: "700",
    minWidth: 90,
    textAlign: "right"
  }
});
