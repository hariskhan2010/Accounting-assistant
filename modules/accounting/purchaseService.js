import { requireSupabase } from "@/services/supabase";
import { createLocalPurchase, filterByCompany, loadAccountingState } from "./localAccountingStore";
import { isSupabaseConfigured } from "@/services/supabase";

export async function listPurchases({ companyId, from, to } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    return { data: filterByCompany(state.purchases, companyId), error: null };
  }

  let query = requireSupabase().from("purchases").select("*").order("date", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  return query;
}

export async function createPurchase(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalPurchase(payload);
    return { data: state.purchases[0], error: null };
  }

  return requireSupabase().from("purchases").insert(payload).select().single();
}
