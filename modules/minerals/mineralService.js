import { requireSupabase } from "@/services/supabase";
import { isSupabaseConfigured } from "@/services/supabase";
import { createLocalMineral, filterByCompany, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export async function listMinerals({ companyId, status } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    const data = filterByCompany(state.minerals, companyId).filter((mineral) => !status || mineral.status === status);
    return { data, error: null };
  }

  let query = requireSupabase().from("minerals").select("*").order("date", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (status) query = query.eq("status", status);

  return query;
}

export async function createMineral(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalMineral(payload);
    return { data: state.minerals[0], error: null };
  }

  return requireSupabase().from("minerals").insert(payload).select().single();
}
