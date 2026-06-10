import { requireSupabase } from "@/services/supabase";
import { createLocalSale, filterByCompany, generateInvoiceNumber, loadAccountingState } from "./localAccountingStore";
import { isSupabaseConfigured } from "@/services/supabase";

export async function listSales({ companyId, from, to } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    return { data: filterByCompany(state.sales, companyId), error: null };
  }

  let query = requireSupabase().from("sales").select("*").order("date", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);

  return query;
}

export async function createSale(payload) {
  if (!isSupabaseConfigured) {
    try {
      const state = await createLocalSale(payload);
      return { data: state.sales[0], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  return requireSupabase().from("sales").insert(payload).select().single();
}

export { generateInvoiceNumber };
