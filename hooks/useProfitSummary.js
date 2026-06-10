import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { calculateSummary, formatMoney, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export function useProfitSummary(companyId = "all") {
  const [summary, setSummary] = useState({
    revenue: "Rs 0",
    purchases: "Rs 0",
    expenses: "Rs 0",
    netProfit: "Rs 0",
    closingBalance: "Rs 0"
  });

  const refresh = useCallback(async () => {
    const state = await loadAccountingState();
    const totals = calculateSummary(state, companyId);
    setSummary({
      revenue: formatMoney(totals.totalSales),
      purchases: formatMoney(totals.totalPurchases),
      expenses: formatMoney(totals.totalExpenses),
      netProfit: formatMoney(totals.netProfit),
      closingBalance: formatMoney(totals.closingBalance)
    });
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { summary, refresh };
}
