import { requireSupabase } from "@/services/supabase";
import { createLocalExpense, filterByCompany, loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { isSupabaseConfigured } from "@/services/supabase";

export async function listExpenses({ companyId, type, from, to } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    const data = filterByCompany(state.expenses, companyId).filter((expense) => !type || expense.type === type);
    return { data, error: null };
  }

  let query = requireSupabase().from("expenses").select("*").order("date", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (type) query = query.eq("type", type);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  return query;
}

export async function createExpense(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalExpense(payload);
    return { data: state.expenses[0], error: null };
  }

  return requireSupabase().from("expenses").insert(payload).select().single();
}
