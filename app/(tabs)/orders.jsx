import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { FadeInView } from "@/components/animated/FadeInView";
import { Card } from "@/components/ui/Card";
import { OrderStats } from "@/components/orders/OrderStats";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrderCard } from "@/components/orders/OrderCard";
import { getOrdersStats, listOrders, updateOrderStatus } from "@/modules/orders/ordersService";
import { colors } from "@/theme";

export default function OrdersScreen() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [stats, setStats] = useState({ total: 0, pending: 0, shipped: 0, delivered: 0, revenue: 0 });
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [statsResult, ordersResult] = await Promise.all([
      getOrdersStats(),
      listOrders({})
    ]);
    setStats(statsResult);
    setOrders(ordersResult.data || ordersResult || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "ebay" || activeFilter === "etsy") return o.platform === activeFilter;
    return o.status === activeFilter;
  });

  async function handleMarkShipped(orderId) {
    const { error } = await updateOrderStatus(orderId, "shipped");
    if (error) {
      Alert.alert("Error", "Failed to update order status");
      return;
    }
    loadData();
  }

  function handlePrintLabel(order) {
    Alert.alert(
      "Print Shipping Label",
      `Shipping label for ${order.customerName || "customer"}\n\nUse your connected printer or export to PDF.`
    );
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View>
        <LuxuryScreenHeader colorIndex={3} title="Orders" subtitle="eBay & Etsy order management" />
        <Pressable style={styles.settingsBtn} onPress={() => router.push("/settings")}>
          <Ionicons name="settings-outline" size={18} color={colors.primary} />
          <Text style={styles.settingsText}>Connect Platforms</Text>
        </Pressable>
      </View>

      <FadeInView delay={80}>
        <OrderStats stats={stats} />
      </FadeInView>

      <FadeInView delay={120}>
        <OrderFilters active={activeFilter} onChange={setActiveFilter} />
      </FadeInView>

      <FadeInView delay={160}>
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"}
          </Text>
        </View>
      </FadeInView>

      {filteredOrders.length === 0 ? (
        <FadeInView delay={200}>
          <Card>
            <EmptyState icon="orders" title="No orders yet" subtitle="Orders from eBay and Etsy will appear here automatically when customers purchase." />
          </Card>
        </FadeInView>
      ) : (
        filteredOrders.map((order, i) => (
          <FadeInView key={order.id} delay={200 + i * 60}>
            <OrderCard
              order={order}
              onMarkShipped={handleMarkShipped}
              onPrintLabel={handlePrintLabel}
            />
          </FadeInView>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 40
  },
  screen: {
    backgroundColor: colors.backgroundDeep,
    flex: 1
  },
  countRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  countText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },

  settingsBtn: {
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 4,
    marginRight: 16,
    marginTop: -8,
    padding: 4
  },
  settingsText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600"
  }
});
