import { requireSupabase } from "@/services/supabase";
import { createLocalPurchase, deleteLocalPurchase, filterByCompany, loadAccountingState } from "./localAccountingStore";
import { isSupabaseConfigured } from "@/services/supabase";

export async function listPurchases({ companyId, from, to } = {}) {
  const state = await loadAccountingState();
  const localData = filterByCompany(state.purchases, companyId);

  if (!isSupabaseConfigured) return { data: localData, error: null };

  try {
    let query = requireSupabase().from("purchases").select("*").order("date", { ascending: false });
    if (companyId) query = query.eq("company_id", companyId);
    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);
    const { data: remote } = await query;
    const merged = [...(remote || []), ...localData];
    const seen = new Set();
    return { data: merged.filter((item) => { const key = item.id; if (seen.has(key)) return false; seen.add(key); return true; }), error: null };
  } catch {
    return { data: localData, error: null };
  }
}

export async function deletePurchase(id) {
  if (!isSupabaseConfigured) {
    await deleteLocalPurchase(id);
    return { data: true, error: null };
  }
  await deleteLocalPurchase(id);
  try {
    await requireSupabase().from("purchases").delete().eq("id", id);
  } catch {}
  return { data: true, error: null };
}

export async function createPurchase(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalPurchase(payload);
    return { data: state.purchases[0], error: null };
  }

  const state = await createLocalPurchase(payload);
  try {
    await requireSupabase().from("purchases").insert(payload);
  } catch {}
  return { data: state.purchases[0], error: null };
}
