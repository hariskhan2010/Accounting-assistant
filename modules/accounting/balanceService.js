import { requireSupabase } from "@/services/supabase";
import { calculateSummary, loadAccountingState } from "./localAccountingStore";
import { isSupabaseConfigured } from "@/services/supabase";

export async function listClosingBalances({ companyId, periodType } = {}) {
  if (!isSupabaseConfigured) {
    const state = await loadAccountingState();
    const summary = calculateSummary(state, companyId);
    return {
      data: [
        {
          id: `${companyId || "all"}-${periodType || "all"}`,
          companyId: companyId || "all",
          periodType: periodType || "all",
          periodStart: new Date().toISOString().slice(0, 10),
          openingBalance: 0,
          totalSales: summary.totalSales,
          totalPurchases: summary.totalPurchases,
          totalExpenses: summary.totalExpenses,
          netProfit: summary.netProfit,
          closingBalance: summary.closingBalance
        }
      ],
      error: null
    };
  }

  let query = requireSupabase().from("closing_balances").select("*").order("period_start", { ascending: false });

  if (companyId) query = query.eq("company_id", companyId);
  if (periodType) query = query.eq("period_type", periodType);

  return query;
}
