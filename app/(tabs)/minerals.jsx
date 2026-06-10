import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { DataTable } from "@/components/ui/DataTable";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { COMPANY_FILTERS, COMPANIES, MINERAL_STATUSES, getCompanyName, getMineralStatusLabel } from "@/modules/accounting/constants";
import { formatMoney } from "@/modules/accounting/localAccountingStore";
import { createMineral, listMinerals } from "@/modules/minerals/mineralService";
import { colors } from "@/theme";

const initialForm = {
  companyId: "company-a",
  date: new Date().toISOString().slice(0, 10),
  name: "",
  purchasePrice: "",
  salePrice: "",
  status: "in_stock"
};

const columns = [
  { key: "date", label: "Date" },
  { key: "company", label: "Entity" },
  { key: "name", label: "Specimen", width: 180 },
  { key: "statusLabel", label: "Status" },
  { key: "purchaseLabel", label: "Purchase" },
  { key: "saleLabel", label: "Sale" },
  { key: "profitLabel", label: "Profit" }
];

export default function MineralsScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await listMinerals({ companyId: companyFilter });
    setRows(
      (data || []).map((mineral) => ({
        ...mineral,
        company: getCompanyName(mineral.companyId),
        statusLabel: getMineralStatusLabel(mineral.status),
        purchaseLabel: formatMoney(mineral.purchasePrice),
        saleLabel: mineral.salePrice == null ? "-" : formatMoney(mineral.salePrice),
        profitLabel: formatMoney(mineral.profit)
      }))
    );
  }, [companyFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const submit = async () => {
    if (!form.name.trim() || !form.purchasePrice) {
      Alert.alert("Missing details", "Specimen name and purchase price are required.");
      return;
    }

    const { error } = await createMineral(form);
    if (error) {
      Alert.alert("Specimen failed", error.message);
      return;
    }

    setForm({ ...initialForm, companyId: form.companyId, date: form.date });
    refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={5} title="Mineral Specimens" subtitle="Track specimen purchase, sale, status, and profit" />
      <AnimatedCard delay={100}>
        <Text style={styles.cardTitle}>✦ New Specimen</Text>
        <SegmentedControl options={COMPANIES} value={form.companyId} onChange={(companyId) => setForm((current) => ({ ...current, companyId }))} />
        <LuxuryTextInput placeholder="Date YYYY-MM-DD" value={form.date} onChangeText={(date) => setForm((current) => ({ ...current, date }))} />
        <LuxuryTextInput placeholder="Specimen name" value={form.name} onChangeText={(name) => setForm((current) => ({ ...current, name }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Purchase price" value={form.purchasePrice} onChangeText={(purchasePrice) => setForm((current) => ({ ...current, purchasePrice }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Sale price" value={form.salePrice} onChangeText={(salePrice) => setForm((current) => ({ ...current, salePrice }))} />
        <SegmentedControl options={MINERAL_STATUSES} value={form.status} onChange={(status) => setForm((current) => ({ ...current, status }))} />
        <AnimatedGoldButton delay={200} title="Save Specimen" onPress={submit} />
      </AnimatedCard>
      <FadeInView delay={200}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={300}>
        <DataTable columns={columns} rows={rows} emptyLabel="No mineral specimens yet" />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  content: { gap: 16, padding: 16 },
  screen: { backgroundColor: colors.background, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
