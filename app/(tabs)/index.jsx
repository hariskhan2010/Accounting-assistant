import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedStatBox } from "@/components/animated/AnimatedStatBox";
import { FadeInView } from "@/components/animated/FadeInView";
import { GsapReveal } from "@/components/animated/GsapReveal";
import { StaggerList } from "@/components/animated/StaggerList";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useProfitSummary } from "@/hooks/useProfitSummary";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { colors } from "@/theme";

const statDefs = [
  { key: "revenue", label: "Revenue", tone: "success" },
  { key: "purchases", label: "Purchases", tone: "default" },
  { key: "expenses", label: "Expenses", tone: "danger" },
  { key: "netProfit", label: "Net Profit", tone: "success" },
  { key: "closingBalance", label: "Closing Balance", tone: "default" }
];

export default function DashboardScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const { summary } = useProfitSummary(companyFilter);
  const statItems = statDefs.map((def) => ({
    id: def.key,
    ...def,
    value: summary[def.key]
  }));

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <FadeInView delay={200}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Company + Self</Text>
            <Text style={styles.title}>Financial Dashboard</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={300}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>

      <GsapReveal delay={100}>
        <View style={styles.statGrid}>
          <StaggerList
            baseDelay={100}
            items={statItems}
            renderItem={(item) => (
              <AnimatedStatBox
                key={item.id}
                delay={400 + statItems.indexOf(item) * 80}
                label={item.label}
                tone={item.tone}
                value={item.value}
              />
            )}
          />
        </View>
      </GsapReveal>

      <GsapReveal delay={220}>
        <AnimatedCard>
          <Text style={styles.chartTitle}>Revenue Overview</Text>
          <RevenueChart />
        </AnimatedCard>
      </GsapReveal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chartTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.5
  },
  content: {
    gap: 18,
    paddingBottom: 32
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  statGrid: {
    gap: 10,
    paddingHorizontal: 16
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 16
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700"
  }
});
