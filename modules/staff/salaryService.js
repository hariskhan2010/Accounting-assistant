import { requireSupabase } from "@/services/supabase";
import { isSupabaseConfigured } from "@/services/supabase";
import { createLocalSalary, filterByCompany, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export async function listSalaries({ companyId, month, year, status } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    const staffById = new Map(state.staff.map((staffMember) => [staffMember.id, staffMember]));
    const data = filterByCompany(state.salaries, companyId)
      .filter((salary) => !month || salary.month === Number(month))
      .filter((salary) => !year || salary.year === Number(year))
      .filter((salary) => !status || salary.status === status)
      .map((salary) => ({ ...salary, staff: staffById.get(salary.staffId) }));
    return { data, error: null };
  }

  let query = requireSupabase().from("salaries").select("*, staff(*)").order("year", { ascending: false });

  if (month) query = query.eq("month", month);
  if (year) query = query.eq("year", year);
  if (status) query = query.eq("status", status);

  return query;
}

export async function createSalary(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalSalary(payload);
    return { data: state.salaries[0], error: null };
  }

  return requireSupabase().from("salaries").insert(payload).select().single();
}
