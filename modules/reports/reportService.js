import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { buildReportRows, formatMoney, loadAccountingState } from "@/modules/accounting/localAccountingStore";

export async function getFinancialReports({ companyId = "all" } = {}) {
  const state = await loadAccountingState();
  const reports = buildReportRows(state, companyId);

  return {
    data: {
      profitAndLoss: reports.profitAndLoss.map((row) => ({
        ...row,
        amountLabel: formatMoney(row.amount)
      })),
      salesSummary: reports.salesSummary.map((row) => ({
        ...row,
        amountLabel: formatMoney(row.amount)
      })),
      closingBalance: reports.closingBalance.map((row) => ({
        ...row,
        totalSalesLabel: formatMoney(row.totalSales),
        totalPurchasesLabel: formatMoney(row.totalPurchases),
        totalExpensesLabel: formatMoney(row.totalExpenses),
        totalSalariesLabel: formatMoney(row.totalSalaries),
        mineralProfitLabel: formatMoney(row.mineralProfit),
        netProfitLabel: formatMoney(row.netProfit),
        closingBalanceLabel: formatMoney(row.closingBalance)
      })),
      filters: COMPANY_FILTERS
    },
    error: null
  };
}
