import { useEffect, useState } from "react";
import { calculateSummary, formatMoney, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export function useRevenue(companyId = "all") {
  const [revenue, setRevenue] = useState("Rs 0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadAccountingState().then((state) => {
      if (!mounted) return;
      setRevenue(formatMoney(calculateSummary(state, companyId).totalSales));
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, [companyId]);

  return { revenue, loading };
}
