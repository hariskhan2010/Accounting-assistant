import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { DataTable } from "@/components/ui/DataTable";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { COMPANY_FILTERS, COMPANIES, STOCK_CATEGORIES, UNITS, getCompanyName, getStockCategoryLabel } from "@/modules/accounting/constants";
import { createPurchase, deletePurchase, listPurchases } from "@/modules/accounting/purchaseService";
import { formatMoney } from "@/modules/accounting/localAccountingStore";
import { colors } from "@/theme";

const initialForm = {
  companyId: "company-a",
  date: new Date().toISOString().slice(0, 10),
  item: "",
  category: "raw",
  quantity: "",
  unit: "ct",
  unitPrice: "",
  notes: ""
};

const columns = [
  { key: "date", label: "Date" },
  { key: "company", label: "Entity" },
  { key: "item", label: "Item", width: 180 },
  { key: "categoryLabel", label: "Category", width: 150 },
  { key: "quantityLabel", label: "Qty" },
  { key: "totalLabel", label: "Total" }
];

export default function PurchasesScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await listPurchases({ companyId: companyFilter });
    setRows(
      (data || []).map((purchase) => ({
        ...purchase,
        company: getCompanyName(purchase.companyId),
        categoryLabel: getStockCategoryLabel(purchase.category),
        quantityLabel: `${purchase.quantity} ${purchase.unit}`,
        totalLabel: formatMoney(purchase.total)
      }))
    );
  }, [companyFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async () => {
    if (!form.item.trim() || !form.quantity || !form.unitPrice) {
      Alert.alert("Missing details", "Item, quantity, and unit price are required.");
      return;
    }

    const { error } = await createPurchase(form);
    if (error) {
      Alert.alert("Purchase failed", error.message);
      return;
    }

    setForm({ ...initialForm, companyId: form.companyId, date: form.date });
    Alert.alert("Success", `Purchase of ${form.item} has been saved.`);
    refresh();
  };

  function handleDelete(purchase) {
    Alert.alert(
      "Delete Purchase",
      `Remove ${purchase.item} (${purchase.quantity} ${purchase.unit}) permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deletePurchase(purchase.id);
            refresh();
          }
        }
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={1} title="Purchases" subtitle="Raw gemstone buying with stock-in tracking" />
      <AnimatedCard delay={100}>
        <Text style={styles.cardTitle}>✦ New Purchase</Text>
        <SegmentedControl options={COMPANIES} value={form.companyId} onChange={(companyId) => setForm((current) => ({ ...current, companyId }))} />
        <LuxuryTextInput placeholder="Date YYYY-MM-DD" value={form.date} onChangeText={(date) => setForm((current) => ({ ...current, date }))} />
        <LuxuryTextInput placeholder="Item name" value={form.item} onChangeText={(item) => setForm((current) => ({ ...current, item }))} />
        <SegmentedControl options={STOCK_CATEGORIES} value={form.category} onChange={(category) => setForm((current) => ({ ...current, category }))} />
        <View style={styles.row}>
          <LuxuryTextInput keyboardType="numeric" placeholder="Quantity" style={styles.flex} value={form.quantity} onChangeText={(quantity) => setForm((current) => ({ ...current, quantity }))} />
          <SegmentedControl options={UNITS.map((unit) => ({ id: unit, name: unit }))} value={form.unit} onChange={(unit) => setForm((current) => ({ ...current, unit }))} />
        </View>
        <LuxuryTextInput keyboardType="numeric" placeholder="Unit price" value={form.unitPrice} onChangeText={(unitPrice) => setForm((current) => ({ ...current, unitPrice }))} />
        <LuxuryTextInput placeholder="Notes" value={form.notes} onChangeText={(notes) => setForm((current) => ({ ...current, notes }))} />
        <AnimatedGoldButton delay={200} title="Save Purchase" onPress={submit} />
      </AnimatedCard>
      <FadeInView delay={200}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={300}>
        <DataTable columns={columns} rows={rows} emptyLabel="No purchases yet" onRowPress={handleDelete} />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  content: { gap: 16, padding: 16 },
  flex: { flex: 1 },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: 12
  },
  row: { gap: 10 },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
