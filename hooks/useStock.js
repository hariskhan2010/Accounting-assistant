import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getCompanyName, getStockCategoryLabel } from "@/modules/accounting/constants";
import { calculateStockBalances, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export function useStock(companyId = "all") {
  const [stock, setStock] = useState([]);

  const refresh = useCallback(async () => {
    const state = await loadAccountingState();
    const balances = calculateStockBalances(state.stockEntries, companyId).map((balance) => ({
      ...balance,
      company: getCompanyName(balance.companyId),
      categoryLabel: getStockCategoryLabel(balance.category),
      quantity: String(balance.quantity)
    }));
    setStock(balances);
  }, [companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { stock, refresh };
}
