import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { FadeInView } from "@/components/animated/FadeInView";
import { Card } from "@/components/ui/Card";
import { useProfitSummary } from "@/hooks/useProfitSummary";
import { colors } from "@/theme";

const metricDefs = {
  revenue: { key: "revenue", label: "Revenue", tone: "success" },
  purchases: { key: "purchases", label: "Purchases", tone: "default" },
  expenses: { key: "expenses", label: "Expenses", tone: "danger" },
  netProfit: { key: "netProfit", label: "Net Profit", tone: "success" },
  closingBalance: { key: "closingBalance", label: "Closing Balance", tone: "default" }
};

export default function DashboardBreakdownScreen() {
  const { metric } = useLocalSearchParams();
  const metricDef = metricDefs[metric] || metricDefs.revenue;
  const { summary: companySummary } = useProfitSummary("company-a");
  const { summary: selfSummary } = useProfitSummary("self");

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <FadeInView>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>All Entities</Text>
          <Text style={styles.title}>{metricDef.label} Breakdown</Text>
          <Text style={styles.subtitle}>Company is shown first. Self is shown below.</Text>
        </View>
      </FadeInView>

      <FadeInView delay={100}>
        <EntityBreakdownCard
          description="Business account"
          label="Company"
          tone={metricDef.tone}
          value={companySummary[metricDef.key]}
        />
      </FadeInView>

      <FadeInView delay={180}>
        <EntityBreakdownCard
          description="Personal account"
          label="Self"
          tone={metricDef.tone}
          value={selfSummary[metricDef.key]}
        />
      </FadeInView>
    </ScrollView>
  );
}

function EntityBreakdownCard({ label, description, value, tone }) {
  return (
    <Card>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.entityLabel}>{label}</Text>
          <Text style={styles.entityDescription}>{description}</Text>
        </View>
        <View style={[styles.badge, tone === "danger" && styles.badgeDanger, tone === "success" && styles.badgeSuccess]} />
      </View>
      <Text style={[styles.value, tone === "danger" && styles.valueDanger, tone === "success" && styles.valueSuccess]}>
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 12,
    width: 12
  },
  badgeDanger: {
    backgroundColor: colors.danger
  },
  badgeSuccess: {
    backgroundColor: colors.success
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 32
  },
  entityDescription: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4
  },
  entityLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  header: {
    gap: 6
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "800"
  },
  value: {
    color: colors.primary,
    fontSize: 30,
    fontVariant: ["tabular-nums"],
    fontWeight: "900",
    marginTop: 18
  },
  valueDanger: {
    color: colors.danger
  },
  valueSuccess: {
    color: colors.success
  }
});
