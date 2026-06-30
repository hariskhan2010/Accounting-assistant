import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { DataTable } from "@/components/ui/DataTable";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { COMPANY_FILTERS, COMPANIES, STOCK_CATEGORIES, UNITS, getCompanyName, getStockCategoryLabel } from "@/modules/accounting/constants";
import { formatMoney, generateInvoiceNumber, loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { createSale, listSales } from "@/modules/accounting/saleService";
import { colors } from "@/theme";

const initialForm = {
  companyId: "company-a",
  date: new Date().toISOString().slice(0, 10),
  item: "",
  category: "polished",
  quantity: "",
  unit: "ct",
  unitPrice: "",
  buyer: "",
  invoiceNo: ""
};

const columns = [
  { key: "invoiceNo", label: "Invoice", width: 140 },
  { key: "date", label: "Date" },
  { key: "company", label: "Entity" },
  { key: "buyer", label: "Buyer", width: 180 },
  { key: "item", label: "Item", width: 180 },
  { key: "categoryLabel", label: "Category", width: 150 },
  { key: "quantityLabel", label: "Qty" },
  { key: "totalLabel", label: "Total" }
];

export default function SalesScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await listSales({ companyId: companyFilter });
    setRows(
      (data || []).map((sale) => ({
        ...sale,
        company: getCompanyName(sale.companyId),
        categoryLabel: getStockCategoryLabel(sale.category),
        quantityLabel: `${sale.quantity} ${sale.unit}`,
        totalLabel: formatMoney(sale.total)
      }))
    );
  }, [companyFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    loadAccountingState().then((state) => {
      setForm((current) => ({
        ...current,
        invoiceNo: current.invoiceNo || generateInvoiceNumber(state.sales.length + 1)
      }));
    });
  }, []);

  const submit = async () => {
    if (!form.item.trim() || !form.buyer.trim() || !form.quantity || !form.unitPrice) {
      Alert.alert("Missing details", "Buyer, item, quantity, and unit price are required.");
      return;
    }

    const { error } = await createSale(form);
    if (error) {
      Alert.alert("Sale failed", error.message);
      return;
    }

    const state = await loadAccountingState();
    setForm({
      ...initialForm,
      companyId: form.companyId,
      date: form.date,
      invoiceNo: generateInvoiceNumber(state.sales.length + 1)
    });
    Alert.alert("Success", `Sale to ${form.buyer} for ${form.item} has been saved.`);
    refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={2} title="Sales" subtitle="Invoice sales with stock-out control" />
      <AnimatedCard delay={100}>
        <Text style={styles.cardTitle}>✦ New Sale</Text>
        <SegmentedControl options={COMPANIES} value={form.companyId} onChange={(companyId) => setForm((current) => ({ ...current, companyId }))} />
        <LuxuryTextInput placeholder="Invoice no" value={form.invoiceNo} onChangeText={(invoiceNo) => setForm((current) => ({ ...current, invoiceNo }))} />
        <LuxuryTextInput placeholder="Date YYYY-MM-DD" value={form.date} onChangeText={(date) => setForm((current) => ({ ...current, date }))} />
        <LuxuryTextInput placeholder="Buyer name" value={form.buyer} onChangeText={(buyer) => setForm((current) => ({ ...current, buyer }))} />
        <LuxuryTextInput placeholder="Item name" value={form.item} onChangeText={(item) => setForm((current) => ({ ...current, item }))} />
        <SegmentedControl options={STOCK_CATEGORIES} value={form.category} onChange={(category) => setForm((current) => ({ ...current, category }))} />
        <View style={styles.row}>
          <LuxuryTextInput keyboardType="numeric" placeholder="Quantity" style={styles.flex} value={form.quantity} onChangeText={(quantity) => setForm((current) => ({ ...current, quantity }))} />
          <SegmentedControl options={UNITS.map((unit) => ({ id: unit, name: unit }))} value={form.unit} onChange={(unit) => setForm((current) => ({ ...current, unit }))} />
        </View>
        <LuxuryTextInput keyboardType="numeric" placeholder="Unit price" value={form.unitPrice} onChangeText={(unitPrice) => setForm((current) => ({ ...current, unitPrice }))} />
        <AnimatedGoldButton delay={200} title="Save Sale" onPress={submit} />
      </AnimatedCard>
      <FadeInView delay={200}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={300}>
        <DataTable columns={columns} rows={rows} emptyLabel="No sales yet" />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  content: { gap: 16, padding: 16 },
  flex: { flex: 1 },
  row: { gap: 10 },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
