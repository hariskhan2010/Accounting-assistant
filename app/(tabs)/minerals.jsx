import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { COMPANY_FILTERS, COMPANIES, MINERAL_STATUSES, getCompanyName, getMineralStatusLabel } from "@/modules/accounting/constants";
import { formatMoney } from "@/modules/accounting/localAccountingStore";
import { createMineral, deleteMineral, listMinerals } from "@/modules/minerals/mineralService";
import { colors } from "@/theme";

const initialForm = {
  companyId: "company-a",
  date: new Date().toISOString().slice(0, 10),
  name: "",
  purchasePrice: "",
  salePrice: "",
  status: "in_stock"
};

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

  function handleDelete(item) {
    Alert.alert(
      "Delete Specimen",
      `Remove ${item.name} permanently?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMineral(item.id);
            refresh();
          }
        }
      ]
    );
  }

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

      {rows.length === 0 ? (
        <FadeInView delay={300}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No mineral specimens yet</Text>
          </View>
        </FadeInView>
      ) : (
        rows.map((item, i) => (
          <FadeInView key={item.id || i} delay={300 + i * 60}>
            <View style={styles.card}>
              <Pressable style={styles.delBtn} onPress={() => handleDelete(item)}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Specimen</Text>
                <Text style={styles.value}>{item.name}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Entity</Text>
                <Text style={styles.value}>{item.company}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Status</Text>
                <Text style={[styles.value, item.status === "sold" ? { color: colors.success } : { color: colors.warning }]}>{item.statusLabel}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Purchase</Text>
                <Text style={styles.value}>{item.purchaseLabel}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Sale</Text>
                <Text style={styles.value}>{item.saleLabel}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.label}>Profit</Text>
                <Text style={[styles.value, item.profit >= 0 ? { color: colors.success } : { color: colors.danger }]}>{item.profitLabel}</Text>
              </View>
            </View>
          </FadeInView>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    padding: 14,
    paddingTop: 10,
    position: "relative"
  },
  cardRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  content: { gap: 16, padding: 16 },
  delBtn: {
    alignSelf: "flex-end",
    padding: 4
  },
  empty: {
    alignItems: "center",
    paddingVertical: 40
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14
  },
  label: {
    color: colors.textMuted,
    fontSize: 13
  },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" },
  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  }
});
