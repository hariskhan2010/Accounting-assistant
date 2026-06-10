import { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { FadeInView } from "@/components/animated/FadeInView";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { DataTable } from "@/components/ui/DataTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StockChart } from "@/components/charts/StockChart";
import { useStock } from "@/hooks/useStock";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { colors } from "@/theme";

const columns = [
  { key: "itemName", label: "Item", width: 180 },
  { key: "company", label: "Entity" },
  { key: "categoryLabel", label: "Category", width: 160 },
  { key: "quantity", label: "Qty" },
  { key: "unit", label: "Unit" }
];

export default function StockScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const { stock } = useStock(companyFilter);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={4} title="Stock Overview" subtitle="Live balances for raw, polished, and specimens" />
      <FadeInView delay={80}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={160}>
        <AnimatedCard>
          <Text style={styles.cardTitle}>Stock Distribution</Text>
          <StockChart />
        </AnimatedCard>
      </FadeInView>
      <FadeInView delay={240}>
        <DataTable columns={columns} rows={stock} />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontSize: 15, fontWeight: "700", letterSpacing: 0.5, marginBottom: 12 },
  content: { gap: 16, padding: 16 },
  screen: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
