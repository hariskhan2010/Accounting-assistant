import { useEffect, useState } from "react";
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
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);
  const { summary } = useProfitSummary(companyFilter);
  const { summary: companySummary } = useProfitSummary("company-a");
  const { summary: selfSummary } = useProfitSummary("self");
  const statItems = statDefs.map((def) => ({
    id: def.key,
    ...def,
    value: summary[def.key]
  }));
  const activeBreakdown = statDefs.find((def) => def.key === selectedBreakdown);

  useEffect(() => {
    if (companyFilter !== "all") {
      setSelectedBreakdown(null);
    }
  }, [companyFilter]);

  const toggleBreakdown = (key) => {
    if (companyFilter !== "all") return;
    setSelectedBreakdown((current) => (current === key ? null : key));
  };

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
                active={selectedBreakdown === item.key}
                onPress={companyFilter === "all" ? () => toggleBreakdown(item.key) : undefined}
                showArrow={companyFilter === "all"}
                tone={item.tone}
                value={item.value}
              />
            )}
          />
        </View>
      </GsapReveal>

      {companyFilter === "all" && activeBreakdown ? (
        <FadeInView delay={80}>
          <View style={styles.breakdownPanel}>
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>{activeBreakdown.label} Breakdown</Text>
              <Text style={styles.breakdownSubtitle}>Company and Self shown separately</Text>
            </View>
            <View style={styles.breakdownRow}>
              <View>
                <Text style={styles.breakdownLabel}>Company</Text>
                <Text style={styles.breakdownHint}>Business account</Text>
              </View>
              <Text style={[styles.breakdownValue, activeBreakdown.tone === "danger" && styles.dangerValue, activeBreakdown.tone === "success" && styles.successValue]}>
                {companySummary[activeBreakdown.key]}
              </Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownRow}>
              <View>
                <Text style={styles.breakdownLabel}>Self</Text>
                <Text style={styles.breakdownHint}>Personal account</Text>
              </View>
              <Text style={[styles.breakdownValue, activeBreakdown.tone === "danger" && styles.dangerValue, activeBreakdown.tone === "success" && styles.successValue]}>
                {selfSummary[activeBreakdown.key]}
              </Text>
            </View>
          </View>
        </FadeInView>
      ) : null}

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
  breakdownDivider: {
    backgroundColor: colors.borderLight,
    height: 1
  },
  breakdownHeader: {
    gap: 3
  },
  breakdownHint: {
    color: colors.textDim,
    fontSize: 12
  },
  breakdownLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  breakdownPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginHorizontal: 16,
    padding: 14
  },
  breakdownRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  breakdownSubtitle: {
    color: colors.textMuted,
    fontSize: 12
  },
  breakdownTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800"
  },
  breakdownValue: {
    color: colors.primary,
    flexShrink: 0,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    textAlign: "right"
  },
  content: {
    gap: 18,
    paddingBottom: 32
  },
  dangerValue: {
    color: colors.danger
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
  successValue: {
    color: colors.success
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
