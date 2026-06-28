import { requireSupabase } from "@/services/supabase";
import { isSupabaseConfigured } from "@/services/supabase";
import { createLocalMineral, deleteLocalMineral, filterByCompany, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export async function listMinerals({ companyId, status } = {}) {
  const state = await loadAccountingState();
  const localData = filterByCompany(state.minerals, companyId).filter((mineral) => !status || mineral.status === status);

  if (!isSupabaseConfigured) return { data: localData, error: null };

  try {
    let query = requireSupabase().from("minerals").select("*").order("date", { ascending: false });
    if (companyId) query = query.eq("company_id", companyId);
    if (status) query = query.eq("status", status);
    const { data: remote } = await query;
    const merged = [...(remote || []), ...localData];
    const seen = new Set();
    return { data: merged.filter((item) => { const key = item.id; if (seen.has(key)) return false; seen.add(key); return true; }), error: null };
  } catch {
    return { data: localData, error: null };
  }
}

export async function deleteMineral(id) {
  if (!isSupabaseConfigured) {
    await deleteLocalMineral(id);
    return { data: true, error: null };
  }
  await deleteLocalMineral(id);
  try {
    await requireSupabase().from("minerals").delete().eq("id", id);
  } catch {}
  return { data: true, error: null };
}

export async function createMineral(payload) {
  if (!isSupabaseConfigured) {
    const state = await createLocalMineral(payload);
    return { data: state.minerals[0], error: null };
  }

  const state = await createLocalMineral(payload);
  try {
    await requireSupabase().from("minerals").insert(payload);
  } catch {}
  return { data: state.minerals[0], error: null };
}
