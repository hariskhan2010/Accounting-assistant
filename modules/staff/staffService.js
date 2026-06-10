import { requireSupabase } from "@/services/supabase";
import { isSupabaseConfigured } from "@/services/supabase";
import { createLocalStaff, filterByCompany, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export async function listStaff({ companyId } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    return { data: filterByCompany(state.staff, companyId), error: null };
  }

  return requireSupabase().from("staff").select("*").order("name");
}

export async function createStaff(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalStaff(payload);
    return { data: state.staff[0], error: null };
  }

  return requireSupabase().from("staff").insert(payload).select().single();
}
