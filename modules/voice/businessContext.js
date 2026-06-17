import { calculateStockBalances, calculateSummary, formatMoney, loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { getCompanyName } from "@/modules/accounting/constants";

function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { start, end };
}

function isWithinRange(record, range) {
  return record.date >= range.start && record.date <= range.end;
}

function filterCompany(records, companyId) {
  if (!companyId || companyId === "all") return records;
  return records.filter((record) => record.companyId === companyId);
}

export async function buildVoiceBusinessContext(companyId = "all") {
  const state = await loadAccountingState();
  const monthRange = getMonthRange();
  const monthlyState = {
    ...state,
    purchases: filterCompany(state.purchases.filter((record) => isWithinRange(record, monthRange)), companyId),
    sales: filterCompany(state.sales.filter((record) => isWithinRange(record, monthRange)), companyId),
    expenses: filterCompany(state.expenses.filter((record) => isWithinRange(record, monthRange)), companyId),
    minerals: filterCompany(state.minerals.filter((record) => isWithinRange(record, monthRange)), companyId),
    salaries: filterCompany(state.salaries.filter((record) => record.paymentDate >= monthRange.start && record.paymentDate <= monthRange.end), companyId)
  };
  const allSummary = calculateSummary(state, companyId);
  const monthSummary = calculateSummary(monthlyState, companyId);
  const stockBalances = calculateStockBalances(state.stockEntries, companyId);
  const totalStockQuantity = stockBalances.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const entityName = companyId === "all" ? "Tamam Accounts" : getCompanyName(companyId);

  return {
    currentDate: new Date().toISOString().slice(0, 10),
    monthStart: monthRange.start,
    monthEnd: monthRange.end,
    companyId,
    entityName,
    monthRevenue: monthSummary.totalSales,
    monthPurchases: monthSummary.totalPurchases,
    monthExpenses: monthSummary.totalExpenses,
    monthSalaries: monthSummary.totalSalaries,
    monthMineralProfit: monthSummary.mineralProfit,
    monthNetProfit: monthSummary.netProfit,
    totalRevenue: allSummary.totalSales,
    totalPurchases: allSummary.totalPurchases,
    totalExpenses: allSummary.totalExpenses,
    totalSalaries: allSummary.totalSalaries,
    totalMineralProfit: allSummary.mineralProfit,
    totalNetProfit: allSummary.netProfit,
    closingBalance: allSummary.closingBalance,
    totalStockQuantity,
    stockBalances: stockBalances.slice(0, 12),
    recentSales: filterCompany(state.sales, companyId).slice(0, 5),
    recentPurchases: filterCompany(state.purchases, companyId).slice(0, 5)
  };
}

export function buildGeminiPrompt(transcript, context) {
  return [
    "You are a financial assistant for a gems and minerals trading business.",
    "The user asks in Roman Urdu (Urdu written in English script). Always answer only in Roman Urdu using English alphabet, like 'aap ka stock 50 units hai'.",
    "Never use Arabic/Urdu script. Use English letters only.",
    "Use only the provided business data. If the data is missing, say that clearly in Roman Urdu.",
    `Current date: ${context.currentDate}`,
    `Entity: ${context.entityName}`,
    `This month revenue: ${formatMoney(context.monthRevenue)}`,
    `This month purchases: ${formatMoney(context.monthPurchases)}`,
    `This month expenses: ${formatMoney(context.monthExpenses)}`,
    `This month salaries: ${formatMoney(context.monthSalaries)}`,
    `This month mineral specimen profit: ${formatMoney(context.monthMineralProfit)}`,
    `This month net profit: ${formatMoney(context.monthNetProfit)}`,
    `Closing balance: ${formatMoney(context.closingBalance)}`,
    `Current stock quantity: ${context.totalStockQuantity}`,
    `Question: ${transcript}`
  ].join("\n");
}

export function answerLocallyInUrdu(transcript, context) {
  const question = transcript.toLowerCase();
  const stockWords = ["stock", "اسٹاک", "سٹاک", "باقی"];
  const revenueWords = ["revenue", "sales", "آمدنی", "سیل", "فروخت"];
  const profitWords = ["profit", "منافع", "نفع"];
  const salaryWords = ["salary", "salaries", "تنخواہ", "تنخواہیں"];
  const balanceWords = ["balance", "closing", "بیلنس", "اختتامی"];
  const expenseWords = ["expense", "kharch", "خرچ", "مصارف"];

  if (stockWords.some((word) => question.includes(word))) {
    return `${context.entityName} ka present stock total ${context.totalStockQuantity} units hai.`;
  }

  if (salaryWords.some((word) => question.includes(word))) {
    return `${context.entityName} ki is mahine ki tankhwaon ki total raqam ${formatMoney(context.monthSalaries)} hai.`;
  }

  if (profitWords.some((word) => question.includes(word))) {
    return `${context.entityName} ka is mahine ka khalis munafa ${formatMoney(context.monthNetProfit)} hai.`;
  }

  if (balanceWords.some((word) => question.includes(word))) {
    return `${context.entityName} ka present closing balance ${formatMoney(context.closingBalance)} hai.`;
  }

  if (revenueWords.some((word) => question.includes(word))) {
    return `${context.entityName} ki is mahine ki aamdani ${formatMoney(context.monthRevenue)} hai.`;
  }

  if (expenseWords.some((word) => question.includes(word))) {
    return `${context.entityName} ka is mahine ka total kharch ${formatMoney(context.monthExpenses)} hai.`;
  }

  return `${context.entityName} ke mutabiq is mahine aamdani ${formatMoney(context.monthRevenue)} hai, kharch ${formatMoney(context.monthExpenses)}, tankhwa ${formatMoney(context.monthSalaries)}, aur khalis munafa ${formatMoney(context.monthNetProfit)} hai.`;
}
