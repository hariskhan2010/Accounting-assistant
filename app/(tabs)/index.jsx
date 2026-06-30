import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing
} from "react-native-reanimated";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function AmbientBlob({ size, x, y, color, delay = 0 }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.08);
  const scale = useSharedValue(1);

  useEffect(() => {
    const dur = 4000 + Math.random() * 2000;
    translateX.value = withRepeat(
      withTiming(40 + Math.random() * 30, { duration: dur, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    translateY.value = withRepeat(
      withTiming(-30 - Math.random() * 20, { duration: dur + 1000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.35, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.08, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: x,
          top: y
        },
        animStyle
      ]}
    />
  );
}

function CrestGlow() {
  const opacity = useSharedValue(0.15);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }]
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.glowGold,
          top: -12,
          left: -12
        },
        glowStyle
      ]}
    />
  );
}

function ShimmerBar() {
  const translateX = useSharedValue(-200);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(400, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <View style={styles.shimmerTrack}>
      <Animated.View style={[styles.shimmer, animStyle]} />
    </View>
  );
}

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
      <AmbientBlob size={280} x={-60} y={-40} color={colors.glowGold} delay={0} />
      <AmbientBlob size={200} x={SCREEN_WIDTH - 140} y={120} color={colors.glowPurple} delay={1000} />
      <AmbientBlob size={160} x={SCREEN_WIDTH * 0.3} y={300} color={colors.glowGold} delay={2000} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={200}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Company + Self</Text>
              <Text style={styles.title}>Financial Dashboard</Text>
            </View>
            <View style={styles.crestWrap}>
              <CrestGlow />
              <View style={styles.crestCircle}>
                <Text style={styles.crestIcon}>◆</Text>
              </View>
            </View>
          </View>
          <ShimmerBar />
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
          <AnimatedCard shimmer style={styles.chartCard}>
            <Text style={styles.chartTitle}>Revenue Overview</Text>
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
    color: colors.primary,
    fontFamily: "Montserrat",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: "uppercase"
  },
  content: {
    gap: 20,
    paddingBottom: 40,
    paddingHorizontal: 16
  },
  crestCircle: {
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    borderColor: colors.borderLight,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    height: 56,
    justifyContent: "center",
    position: "relative",
    width: 56,
    zIndex: 2
  },
  crestIcon: {
    color: colors.primary,
    fontSize: 24,
    opacity: 0.7
  },
  crestWrap: {
    height: 56,
    position: "relative",
    width: 56
  },
  shimmer: {
    backgroundColor: colors.primary,
    height: "100%",
    opacity: 0.4,
    width: 60
  },
  shimmerTrack: {
    borderRadius: 2,
    height: 2,
    marginTop: 12,
    overflow: "hidden",
    width: "100%"
  },
  eyebrow: {
    color: colors.textMuted,
    fontFamily: "Montserrat",
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
    backgroundColor: colors.backgroundDeep,
    flex: 1
  },
  title: {
    color: colors.text,
    fontFamily: "Cormorant",
    fontSize: 30,
    fontWeight: "700"
  }
});
