import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { ProfitChart } from "@/components/charts/ProfitChart";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { DataTable } from "@/components/ui/DataTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { getFinancialReports } from "@/modules/reports/reportService";
import { exportFinancialReportPdf } from "@/modules/reports/pdfExport";
import { exportReportExcel } from "@/modules/reports/excelExport";
import { colors } from "@/theme";

const profitColumns = [
  { key: "account", label: "Account", width: 220 },
  { key: "amountLabel", label: "Amount" }
];

const salesColumns = [
  { key: "date", label: "Date" },
  { key: "invoiceNo", label: "Invoice" },
  { key: "buyer", label: "Buyer", width: 180 },
  { key: "item", label: "Item", width: 180 },
  { key: "amountLabel", label: "Amount" }
];

const closingColumns = [
  { key: "entity", label: "Entity" },
  { key: "totalSalesLabel", label: "Sales" },
  { key: "totalPurchasesLabel", label: "Purchases" },
  { key: "totalExpensesLabel", label: "Expenses" },
  { key: "totalSalariesLabel", label: "Salaries" },
  { key: "mineralProfitLabel", label: "Specimen Profit" },
  { key: "netProfitLabel", label: "Net Profit" },
  { key: "closingBalanceLabel", label: "Closing" }
];

export default function ReportsScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [report, setReport] = useState({ profitAndLoss: [], salesSummary: [], closingBalance: [] });

  const refresh = useCallback(async () => {
    const { data } = await getFinancialReports({ companyId: companyFilter });
    setReport(data);
  }, [companyFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const exportPdf = async () => {
    try {
      const result = await exportFinancialReportPdf({ title: "Financial Report", ...report });
      Alert.alert("PDF created", result.uri);
    } catch (error) {
      Alert.alert("PDF export failed", error.message);
    }
  };

  const exportExcel = async () => {
    try {
      const result = await exportReportExcel(report);
      Alert.alert("Excel generated", `${result.fileName} is ready for sharing.`);
    } catch (error) {
      Alert.alert("Excel export failed", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={7} title="Reports" subtitle="P&L, sales summary, closing balance, PDF and Excel" />
      <FadeInView delay={80}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={120}>
        <AnimatedCard>
          <ProfitChart />
        </AnimatedCard>
      </FadeInView>
      <FadeInView delay={160}>
        <View style={styles.actions}>
          <AnimatedGoldButton delay={200} title="Export PDF" onPress={exportPdf} />
          <AnimatedGoldButton delay={250} title="Export Excel" onPress={exportExcel} />
        </View>
      </FadeInView>
      <FadeInView delay={200}>
        <AnimatedCard>
          <Text style={styles.cardTitle}>Profit and Loss</Text>
          <Text style={styles.text}>Includes sales, purchases, expenses, salary payments, and sold specimen profit.</Text>
        </AnimatedCard>
      </FadeInView>
      <FadeInView delay={240}>
        <DataTable columns={profitColumns} rows={report.profitAndLoss} emptyLabel="No profit and loss data yet" />
      </FadeInView>
      <FadeInView delay={280}>
        <AnimatedCard>
          <Text style={styles.cardTitle}>Sales Summary</Text>
          <Text style={styles.text}>Invoice-level sales report for the selected entity.</Text>
        </AnimatedCard>
      </FadeInView>
      <FadeInView delay={320}>
        <DataTable columns={salesColumns} rows={report.salesSummary} emptyLabel="No sales yet" />
      </FadeInView>
      <FadeInView delay={360}>
        <AnimatedCard>
          <Text style={styles.cardTitle}>Closing Balance</Text>
          <Text style={styles.text}>Calculated from the same values shown in the dashboard.</Text>
        </AnimatedCard>
      </FadeInView>
      <FadeInView delay={400}>
        <DataTable columns={closingColumns} rows={report.closingBalance} emptyLabel="No report data yet" />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 },
  content: { gap: 18, padding: 20 },
  actions: { gap: 10 },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  text: { color: colors.textMuted, lineHeight: 21 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
