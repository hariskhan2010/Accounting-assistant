import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AnimatedCard } from "@/components/animated/AnimatedCard";
import { AnimatedGoldButton } from "@/components/animated/AnimatedGoldButton";
import { FadeInView } from "@/components/animated/FadeInView";
import { DataTable } from "@/components/ui/DataTable";
import { LuxuryTextInput } from "@/components/ui/LuxuryTextInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { COMPANIES, COMPANY_FILTERS, SALARY_STATUSES, getCompanyName, getSalaryStatusLabel } from "@/modules/accounting/constants";
import { formatMoney } from "@/modules/accounting/localAccountingStore";
import { createStaff, listStaff } from "@/modules/staff/staffService";
import { createSalary, listSalaries } from "@/modules/staff/salaryService";
import { colors } from "@/theme";

const staffInitial = {
  companyId: "company-a",
  name: "",
  designation: "",
  monthlySalary: "",
  joinDate: new Date().toISOString().slice(0, 10)
};

const salaryInitial = {
  companyId: "company-a",
  staffId: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  amountPaid: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  status: "paid"
};

const staffColumns = [
  { key: "company", label: "Entity" },
  { key: "name", label: "Name", width: 160 },
  { key: "designation", label: "Designation", width: 160 },
  { key: "monthlySalaryLabel", label: "Monthly Salary" },
  { key: "joinDate", label: "Join Date" }
];

const salaryColumns = [
  { key: "company", label: "Entity" },
  { key: "staffName", label: "Staff", width: 160 },
  { key: "period", label: "Period" },
  { key: "amountLabel", label: "Paid" },
  { key: "paymentDate", label: "Payment Date" },
  { key: "statusLabel", label: "Status" }
];

export default function StaffScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [staffForm, setStaffForm] = useState(staffInitial);
  const [salaryForm, setSalaryForm] = useState(salaryInitial);
  const [staffRows, setStaffRows] = useState([]);
  const [salaryRows, setSalaryRows] = useState([]);

  const refresh = useCallback(async () => {
    const [{ data: staffData }, { data: salaryData }] = await Promise.all([
      listStaff({ companyId: companyFilter }),
      listSalaries({ companyId: companyFilter })
    ]);
    const staffById = new Map((staffData || []).map((staffMember) => [staffMember.id, staffMember]));

    setStaffRows(
      (staffData || []).map((staffMember) => ({
        ...staffMember,
        company: getCompanyName(staffMember.companyId),
        monthlySalaryLabel: formatMoney(staffMember.monthlySalary)
      }))
    );
    setSalaryRows(
      (salaryData || []).map((salary) => ({
        ...salary,
        company: getCompanyName(salary.companyId),
        staffName: salary.staff?.name || staffById.get(salary.staffId)?.name || "Unknown",
        period: `${salary.month}/${salary.year}`,
        amountLabel: formatMoney(salary.amountPaid),
        statusLabel: getSalaryStatusLabel(salary.status)
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

  const staffOptions = useMemo(
    () =>
      staffRows
        .filter((staffMember) => staffMember.companyId === salaryForm.companyId)
        .map((staffMember) => ({ id: staffMember.id, name: staffMember.name })),
    [salaryForm.companyId, staffRows]
  );

  const submitStaff = async () => {
    if (!staffForm.name.trim() || !staffForm.designation.trim() || !staffForm.monthlySalary) {
      Alert.alert("Missing details", "Name, designation, and monthly salary are required.");
      return;
    }

    const { error } = await createStaff(staffForm);
    if (error) {
      Alert.alert("Staff failed", error.message);
      return;
    }

    setStaffForm({ ...staffInitial, companyId: staffForm.companyId });
    refresh();
  };

  const submitSalary = async () => {
    if (!salaryForm.staffId || !salaryForm.amountPaid) {
      Alert.alert("Missing details", "Select staff and enter amount paid.");
      return;
    }

    const { error } = await createSalary(salaryForm);
    if (error) {
      Alert.alert("Salary failed", error.message);
      return;
    }

    setSalaryForm({ ...salaryInitial, companyId: salaryForm.companyId, staffId: salaryForm.staffId });
    refresh();
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={styles.screen}>
      <LuxuryScreenHeader colorIndex={6} title="Staff and Salaries" subtitle="Profiles, payroll status, and payment history" />
      <AnimatedCard delay={100}>
        <Text style={styles.cardTitle}>✦ New Staff Profile</Text>
        <SegmentedControl options={COMPANIES} value={staffForm.companyId} onChange={(companyId) => setStaffForm((current) => ({ ...current, companyId }))} />
        <LuxuryTextInput placeholder="Name" value={staffForm.name} onChangeText={(name) => setStaffForm((current) => ({ ...current, name }))} />
        <LuxuryTextInput placeholder="Designation" value={staffForm.designation} onChangeText={(designation) => setStaffForm((current) => ({ ...current, designation }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Monthly salary" value={staffForm.monthlySalary} onChangeText={(monthlySalary) => setStaffForm((current) => ({ ...current, monthlySalary }))} />
        <LuxuryTextInput placeholder="Join date YYYY-MM-DD" value={staffForm.joinDate} onChangeText={(joinDate) => setStaffForm((current) => ({ ...current, joinDate }))} />
        <AnimatedGoldButton delay={200} title="Save Staff" onPress={submitStaff} />
      </AnimatedCard>
      <AnimatedCard delay={150}>
        <Text style={styles.cardTitle}>✦ Salary Payment</Text>
        <SegmentedControl options={COMPANIES} value={salaryForm.companyId} onChange={(companyId) => setSalaryForm((current) => ({ ...current, companyId, staffId: "" }))} />
        <SegmentedControl options={staffOptions.length ? staffOptions : [{ id: "", name: "No Staff" }]} value={salaryForm.staffId} onChange={(staffId) => setSalaryForm((current) => ({ ...current, staffId }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Month" value={salaryForm.month} onChangeText={(month) => setSalaryForm((current) => ({ ...current, month }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Year" value={salaryForm.year} onChangeText={(year) => setSalaryForm((current) => ({ ...current, year }))} />
        <LuxuryTextInput keyboardType="numeric" placeholder="Amount paid" value={salaryForm.amountPaid} onChangeText={(amountPaid) => setSalaryForm((current) => ({ ...current, amountPaid }))} />
        <LuxuryTextInput placeholder="Payment date YYYY-MM-DD" value={salaryForm.paymentDate} onChangeText={(paymentDate) => setSalaryForm((current) => ({ ...current, paymentDate }))} />
        <SegmentedControl options={SALARY_STATUSES} value={salaryForm.status} onChange={(status) => setSalaryForm((current) => ({ ...current, status }))} />
        <AnimatedGoldButton delay={250} title="Save Salary Payment" onPress={submitSalary} />
      </AnimatedCard>
      <FadeInView delay={180}>
        <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
      </FadeInView>
      <FadeInView delay={220}>
        <DataTable columns={staffColumns} rows={staffRows} emptyLabel="No staff profiles yet" />
      </FadeInView>
      <FadeInView delay={260}>
        <DataTable columns={salaryColumns} rows={salaryRows} emptyLabel="No salary payments yet" />
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cardTitle: { color: colors.primary, fontFamily: "Montserrat", fontSize: 13, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
  content: { gap: 18, padding: 20 },
  screen: { backgroundColor: colors.backgroundDeep, flex: 1 },
  title: { color: colors.text, fontSize: 26, fontWeight: "700" }
});
