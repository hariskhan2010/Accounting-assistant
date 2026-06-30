import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { FadeInView } from "@/components/animated/FadeInView";
import { Barcode128 } from "@/components/ui/Barcode128";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { DataTable } from "@/components/ui/DataTable";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StockEntryModal } from "@/components/orders/StockEntryModal";
import { useStock } from "@/hooks/useStock";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { deleteStockItem, listStockItems } from "@/modules/orders/stockItemsService";
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
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [barcodeItems, setBarcodeItems] = useState([]);
  const { stock, refresh } = useStock(companyFilter);

  async function loadBarcodeItems() {
    const { data } = await listStockItems({});
    setBarcodeItems(data || []);
  }

  useFocusEffect(
    useCallback(() => {
      loadBarcodeItems();
    }, [])
  );

  function handleDelete(item) {
    Alert.alert(
      "Delete Stock",
      `Remove ${item.stockId} (${item.gemType || "—"}) permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteStockItem(item.id);
            loadBarcodeItems();
          }
        }
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={4} title="Stock Overview" subtitle="Live balances for raw, polished, and specimens" />

      <Pressable style={styles.newEntryBtn} onPress={() => setShowEntryModal(true)}>
        <Ionicons name="barcode-outline" size={18} color={colors.background} />
        <Text style={styles.newEntryText}>New Barcode Entry</Text>
      </Pressable>

      <FadeInView delay={80}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>

      {barcodeItems.length > 0 && (
        <FadeInView delay={100}>
          <AnimatedCard>
            <Text style={styles.cardTitle}>Barcode Items</Text>
            {barcodeItems.map((item, i) => (
              <View key={item.stockId || i} style={styles.barcodeRow}>
                <Barcode128 value={item.stockId} width={200} height={36} showValue={false} />
                <View style={styles.barcodeMeta}>
                  <Text style={styles.idText}>{item.stockId}</Text>
                  <Text style={styles.gemText}>{item.gemType || "—"} • {item.weight ? `${item.weight} ct` : "—"}</Text>
                  <Text style={[styles.statusText, item.status === "available" ? styles.available : styles.sold]}>
                    {item.status === "available" ? "Available" : "Sold"}
                  </Text>
                </View>
                <Pressable style={styles.delBtn} onPress={() => handleDelete(item)}>
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </Pressable>
              </View>
            ))}
          </AnimatedCard>
        </FadeInView>
      )}

      <FadeInView delay={240}>
        <DataTable columns={columns} rows={stock} />
      </FadeInView>

      <StockEntryModal
        visible={showEntryModal}
        onClose={() => setShowEntryModal(false)}
        onSaved={() => { refresh(); loadBarcodeItems(); }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  available: {
    color: colors.success
  },
  barcodeMeta: {
    flex: 1,
    gap: 2
  },
  barcodeRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    padding: 10
  },
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, marginBottom: 12, textTransform: "uppercase" },
  content: { gap: 16, padding: 16 },
  delBtn: {
    padding: 6
  },
  gemText: {
    color: colors.textMuted,
    fontSize: 12
  },
  idText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  newEntryBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 12
  },
  newEntryText: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "700"
  },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  sold: {
    color: colors.danger
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
