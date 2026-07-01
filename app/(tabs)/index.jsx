import { useRouter } from "expo-router";
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
  const router = useRouter();
  const [companyFilter, setCompanyFilter] = useState("all");
  const { summary } = useProfitSummary(companyFilter);
  const statItems = statDefs.map((def) => ({
    id: def.key,
    ...def,
    value: summary[def.key]
  }));

  const openBreakdown = (key) => {
    if (companyFilter !== "all") return;
    router.push({
      pathname: "/dashboard-breakdown/[metric]",
      params: { metric: key }
    });
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={200}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Gems & Minerals</Text>
              <Text style={styles.title}>Dashboard</Text>
            </View>
            <View style={styles.crestCircle}>
              <Text style={styles.crestIcon}>◆</Text>
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
                  onPress={companyFilter === "all" ? () => openBreakdown(item.key) : undefined}
                  showArrow={companyFilter === "all"}
                  tone={item.tone}
                  value={item.value}
                />
              )}
            />
          </View>
        </GsapReveal>

        <GsapReveal delay={220}>
          <AnimatedCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>Revenue</Text>
            <RevenueChart />
          </AnimatedCard>
        </GsapReveal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    marginHorizontal: 16
  },
  chartTitle: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: "uppercase"
  },
  content: {
    gap: 20,
    paddingBottom: 40,
    paddingTop: 16,
    paddingHorizontal: 16
  },
  crestCircle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  crestIcon: {
    color: colors.primary,
    fontSize: 22,
    opacity: 0.7
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 4,
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
    backgroundColor: colors.backgroundDeep,
    flex: 1
  },
  title: {
    color: colors.text,
    fontFamily: "Cormorant",
    fontSize: 28,
    fontWeight: "700"
  }
});
