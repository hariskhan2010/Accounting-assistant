import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { SuccessBurst } from "@/components/animated/SuccessBurst";
import { DataTable } from "@/components/ui/DataTable";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { COMPANY_FILTERS, COMPANIES, EXPENSE_TYPES, getCompanyName, getExpenseTypeLabel } from "@/modules/accounting/constants";
import { formatMoney } from "@/modules/accounting/localAccountingStore";
import { createExpense, listExpenses } from "@/modules/expenses/expenseService";
import { colors } from "@/theme";

const initialForm = {
  companyId: "company-a",
  date: new Date().toISOString().slice(0, 10),
  type: "cutting",
  amount: "",
  description: ""
};

const columns = [
  { key: "date", label: "Date" },
  { key: "company", label: "Entity" },
  { key: "typeLabel", label: "Type", width: 180 },
  { key: "amountLabel", label: "Amount" },
  { key: "description", label: "Description", width: 220 }
];

export default function ExpensesScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await listExpenses({ companyId: companyFilter });
    setRows(
      (data || []).map((expense) => ({
        ...expense,
        company: getCompanyName(expense.companyId),
        typeLabel: getExpenseTypeLabel(expense.type),
        amountLabel: formatMoney(expense.amount)
      }))
    );
  }, [companyFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = async () => {
    if (!form.amount) {
      Alert.alert("Missing amount", "Expense amount is required.");
      return;
    }

    const { error } = await createExpense(form);
    if (error) {
      Alert.alert("Expense failed", error.message);
      return;
    }

    setForm({ ...initialForm, companyId: form.companyId, date: form.date, type: form.type });
    setShowSuccess(true);
    refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={3} title="Expenses" subtitle="Cutting, polishing, lab, shipping, rent, utilities" />
      <AnimatedCard delay={100} shimmer>
        <SuccessBurst visible={showSuccess} onComplete={() => setShowSuccess(false)} />
        <Text style={styles.cardTitle}>✦ New Expense</Text>
        <SegmentedControl options={COMPANIES} value={form.companyId} onChange={(companyId) => setForm((current) => ({ ...current, companyId }))} />
        <LuxuryTextInput placeholder="Date YYYY-MM-DD" value={form.date} onChangeText={(date) => setForm((current) => ({ ...current, date }))} />
        <SegmentedControl options={EXPENSE_TYPES} value={form.type} onChange={(type) => setForm((current) => ({ ...current, type }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Amount" value={form.amount} onChangeText={(amount) => setForm((current) => ({ ...current, amount }))} />
        <LuxuryTextInput placeholder="Description" value={form.description} onChangeText={(description) => setForm((current) => ({ ...current, description }))} />
        <AnimatedGoldButton delay={200} title="Save Expense" onPress={submit} />
      </AnimatedCard>
      <FadeInView delay={200}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={300}>
        <DataTable columns={columns} rows={rows} emptyLabel="No expenses yet" />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  content: { gap: 16, padding: 16 },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
