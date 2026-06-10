import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { colors } from "@/theme";

function RevenueBar({ item, max, delay: barDelay }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(barDelay, withTiming(item.value / max, { duration: 800 }));
  }, [barDelay, item.value, max, progress]);

  const barStyle = useAnimatedStyle(() => ({
    height: `${Math.max(progress.value * 100, 4)}%`
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.3
  }));

  return (
    <View style={styles.barWrap}>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
        <Animated.View style={[styles.barGlow, glowStyle]} />
      </View>
      <Text style={styles.amount}>Rs {Math.round(item.value).toLocaleString("en-PK")}</Text>
      <Text style={styles.label}>{item.label}</Text>
    </View>
  );
}

export function RevenueChart() {
  const [sales, setSales] = useState([]);

  const refresh = useCallback(async () => {
    const state = await loadAccountingState();
    setSales(state.sales || []);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const chartData = useMemo(() => {
    const buckets = new Map();
    sales.forEach((sale) => {
      const label = sale.date?.slice(5) || "Now";
      buckets.set(label, (buckets.get(label) || 0) + Number(sale.total || 0));
    });

    return Array.from(buckets.entries())
      .slice(-7)
      .map(([label, value]) => ({ label, value }));
  }, [sales]);
  const max = Math.max(...chartData.map((item) => item.value), 1);

  return (
    <View style={styles.chart}>
      {chartData.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No revenue yet</Text>
          <Text style={styles.text}>Sales will appear here as animated revenue bars.</Text>
        </View>
      ) : (
        chartData.map((item, index) => (
          <RevenueBar key={`${item.label}-${index}`} delay={index * 80} item={item} max={max} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  amount: {
    color: colors.text,
    fontSize: 11,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center"
  },
  bar: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0
  },
  barGlow: {
    backgroundColor: colors.glowGold,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0
  },
  barWrap: {
    alignItems: "center",
    flex: 1,
    minWidth: 58
  },
  chart: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
    height: 190,
    paddingTop: 8
  },
  empty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center"
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center"
  },
  text: {
    color: colors.textMuted,
    textAlign: "center"
  },
  track: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 112,
    overflow: "hidden",
    position: "relative",
    width: "100%"
  }
});
