import { useCallback, useState } from "react";
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Barcode128 } from "@/components/ui/Barcode128";
import { FadeInView } from "@/components/animated/FadeInView";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { StockEntryModal } from "@/components/orders/StockEntryModal";
import { deleteStockItem, listStockItems } from "@/modules/orders/stockItemsService";
import { colors } from "@/theme";

export default function BarcodesScreen() {
  const [items, setItems] = useState([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function loadItems() {
    const { data } = await listStockItems({});
    setItems(data || []);
  }

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }

  function handleDelete(item) {
    Alert.alert(
      "Delete Barcode",
      `Remove ${item.stockId} (${item.gemType || "—"}) permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteStockItem(item.id);
            loadItems();
          }
        }
      ]
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.screen}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <LuxuryScreenHeader colorIndex={4} title="Barcodes" subtitle="All generated barcode labels" />

      <Pressable style={styles.addBtn} onPress={() => setShowEntryModal(true)}>
        <Ionicons name="barcode-outline" size={18} color={colors.background} />
        <Text style={styles.addBtnText}>New Barcode Entry</Text>
      </Pressable>

      {items.length === 0 ? (
        <FadeInView delay={100}>
          <View style={styles.empty}>
            <Ionicons name="barcode-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No barcodes yet</Text>
            <Text style={styles.emptySub}>Tap "New Barcode Entry" to generate your first barcode.</Text>
          </View>
        </FadeInView>
      ) : (
        items.map((item, i) => (
          <FadeInView key={item.stockId || i} delay={80 + i * 50}>
            <View style={styles.barcodeCard}>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
              <Barcode128 value={item.stockId} width={300} height={60} />
              <View style={styles.info}>
                <Text style={styles.stockId}>{item.stockId}</Text>
                <Text style={styles.details}>
                  {item.gemType || "—"} • {item.weight ? `${item.weight} ct` : "—"}
                </Text>
                <Text style={[styles.status, item.status === "available" ? styles.available : styles.sold]}>
                  {item.status === "available" ? "Available" : "Sold"}
                </Text>
              </View>
            </View>
          </FadeInView>
        ))
      )}

      <StockEntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSaved={() => { loadItems(); }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 12
  },
  addBtnText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "700"
  },
  available: {
    color: colors.success
  },
  barcodeCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    padding: 16,
    paddingTop: 12,
    position: "relative"
  },
  content: {
    gap: 14,
    padding: 16,
    paddingBottom: 40
  },
  deleteBtn: {
    alignSelf: "flex-end",
    padding: 4
  },
  details: {
    color: colors.textMuted,
    fontSize: 13
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 60
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center"
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "700"
  },
  info: {
    alignItems: "center",
    gap: 4
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sold: {
    color: colors.danger
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  stockId: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1
  }
});
