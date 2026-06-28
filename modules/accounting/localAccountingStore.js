import { createPlatformStorage } from "@/services/platformStorage";
import { COMPANIES, EXPENSE_TYPES, STOCK_CATEGORIES } from "./constants";

const STORAGE_KEY = "gems-accounting:v1";
const storage = createPlatformStorage();

const emptyState = {
  companies: COMPANIES,
  expenseTypes: EXPENSE_TYPES,
  stockCategories: STOCK_CATEGORIES,
  purchases: [],
  sales: [],
  expenses: [],
  stockEntries: [],
  minerals: [],
  staff: [],
  salaries: []
};

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function normalizeState(state) {
  const normalizedState = {
    ...state,
    purchases: normalizeCompanyRecords(state?.purchases),
    sales: normalizeCompanyRecords(state?.sales),
    expenses: normalizeCompanyRecords(state?.expenses),
    stockEntries: normalizeCompanyRecords(state?.stockEntries),
    minerals: normalizeCompanyRecords(state?.minerals),
    staff: normalizeCompanyRecords(state?.staff),
    salaries: normalizeCompanyRecords(state?.salaries)
  };

  return {
    ...emptyState,
    ...normalizedState,
    companies: COMPANIES,
    expenseTypes: EXPENSE_TYPES,
    stockCategories: STOCK_CATEGORIES
  };
}

function normalizeCompanyRecords(records = []) {
  return records.map((record) => ({
    ...record,
    companyId: record.companyId === "company-b" ? "company-a" : record.companyId
  }));
}

export async function loadAccountingState() {
  const raw = await storage.getItem(STORAGE_KEY);
  if (!raw) return emptyState;

  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return emptyState;
  }
}

async function saveAccountingState(state) {
  const normalized = normalizeState(state);
  await storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export async function deleteLocalPurchase(purchaseId) {
  const state = await loadAccountingState();
  state.purchases = state.purchases.filter((p) => p.id !== purchaseId);
  state.stockEntries = state.stockEntries.filter((e) => e.referenceId !== purchaseId);
  await saveAccountingState(state);
  return true;
}

export async function createLocalPurchase(payload) {
  const state = await loadAccountingState();
  const quantity = toNumber(payload.quantity);
  const unitPrice = toNumber(payload.unitPrice);
  const purchase = {
    id: makeId("purchase"),
    companyId: payload.companyId,
    date: payload.date || today(),
    item: payload.item.trim(),
    category: payload.category,
    quantity,
    unit: payload.unit,
    unitPrice,
    total: roundCurrency(quantity * unitPrice),
    notes: payload.notes?.trim() || "",
    createdAt: new Date().toISOString()
  };
  const stockEntry = {
    id: makeId("stock"),
    companyId: purchase.companyId,
    date: purchase.date,
    itemName: purchase.item,
    category: purchase.category,
    direction: "in",
    quantity: purchase.quantity,
    unit: purchase.unit,
    referenceTable: "purchases",
    referenceId: purchase.id,
    createdAt: purchase.createdAt
  };

  return saveAccountingState({
    ...state,
    purchases: [purchase, ...state.purchases],
    stockEntries: [stockEntry, ...state.stockEntries]
  });
}

export async function createLocalSale(payload) {
  const state = await loadAccountingState();
  const quantity = toNumber(payload.quantity);
  const unitPrice = toNumber(payload.unitPrice);
  const balances = calculateStockBalances(state.stockEntries, payload.companyId);
  const matchingBalance = balances.find(
    (balance) =>
      balance.companyId === payload.companyId &&
      balance.itemName.toLowerCase() === payload.item.trim().toLowerCase() &&
      balance.category === payload.category &&
      balance.unit === payload.unit
  );
  const availableQuantity = matchingBalance?.quantity || 0;

  if (!payload.allowNegativeStock && availableQuantity < quantity) {
    throw new Error(`Insufficient stock. Available quantity is ${availableQuantity} ${payload.unit}.`);
  }

  const sale = {
    id: makeId("sale"),
    companyId: payload.companyId,
    date: payload.date || today(),
    item: payload.item.trim(),
    category: payload.category,
    quantity,
    unit: payload.unit,
    unitPrice,
    total: roundCurrency(quantity * unitPrice),
    buyer: payload.buyer.trim(),
    invoiceNo: payload.invoiceNo || generateInvoiceNumber(state.sales.length + 1),
    createdAt: new Date().toISOString()
  };
  const stockEntry = {
    id: makeId("stock"),
    companyId: sale.companyId,
    date: sale.date,
    itemName: sale.item,
    category: sale.category,
    direction: "out",
    quantity: sale.quantity,
    unit: sale.unit,
    referenceTable: "sales",
    referenceId: sale.id,
    createdAt: sale.createdAt
  };

  return saveAccountingState({
    ...state,
    sales: [sale, ...state.sales],
    stockEntries: [stockEntry, ...state.stockEntries]
  });
}

export async function createLocalExpense(payload) {
  const state = await loadAccountingState();
  const expense = {
    id: makeId("expense"),
    companyId: payload.companyId,
    date: payload.date || today(),
    type: payload.type,
    amount: roundCurrency(toNumber(payload.amount)),
    description: payload.description?.trim() || "",
    createdAt: new Date().toISOString()
  };

  return saveAccountingState({
    ...state,
    expenses: [expense, ...state.expenses]
  });
}

export async function deleteLocalMineral(mineralId) {
  const state = await loadAccountingState();
  state.minerals = state.minerals.filter((m) => m.id !== mineralId);
  state.stockEntries = state.stockEntries.filter((e) => e.referenceId !== mineralId);
  await saveAccountingState(state);
  return true;
}

export async function createLocalMineral(payload) {
  const state = await loadAccountingState();
  const purchasePrice = roundCurrency(toNumber(payload.purchasePrice));
  const salePrice = payload.salePrice === "" || payload.salePrice == null ? null : roundCurrency(toNumber(payload.salePrice));
  const status = payload.status || (salePrice == null ? "in_stock" : "sold");
  const mineral = {
    id: makeId("mineral"),
    companyId: payload.companyId,
    date: payload.date || today(),
    name: payload.name.trim(),
    purchasePrice,
    salePrice,
    status,
    profit: roundCurrency((salePrice || 0) - purchasePrice),
    createdAt: new Date().toISOString()
  };
  const stockEntry = {
    id: makeId("stock"),
    companyId: mineral.companyId,
    date: mineral.date,
    itemName: mineral.name,
    category: "specimen",
    direction: status === "sold" ? "out" : "in",
    quantity: 1,
    unit: "pcs",
    referenceTable: "minerals",
    referenceId: mineral.id,
    createdAt: mineral.createdAt
  };

  return saveAccountingState({
    ...state,
    minerals: [mineral, ...state.minerals],
    stockEntries: [stockEntry, ...state.stockEntries]
  });
}

export async function createLocalStaff(payload) {
  const state = await loadAccountingState();
  const staffMember = {
    id: makeId("staff"),
    companyId: payload.companyId,
    name: payload.name.trim(),
    designation: payload.designation.trim(),
    monthlySalary: roundCurrency(toNumber(payload.monthlySalary)),
    joinDate: payload.joinDate || today(),
    active: true,
    createdAt: new Date().toISOString()
  };

  return saveAccountingState({
    ...state,
    staff: [staffMember, ...state.staff]
  });
}

export async function createLocalSalary(payload) {
  const state = await loadAccountingState();
  const salary = {
    id: makeId("salary"),
    companyId: payload.companyId,
    staffId: payload.staffId,
    month: toNumber(payload.month),
    year: toNumber(payload.year),
    amountPaid: roundCurrency(toNumber(payload.amountPaid)),
    paymentDate: payload.paymentDate || today(),
    status: payload.status,
    createdAt: new Date().toISOString()
  };

  return saveAccountingState({
    ...state,
    salaries: [salary, ...state.salaries]
  });
}

export function generateInvoiceNumber(sequence = 1, date = new Date()) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const number = String(sequence).padStart(4, "0");
  return `INV-${yyyy}${mm}-${number}`;
}

export function filterByCompany(records, companyId) {
  if (!companyId || companyId === "all") return records;
  return records.filter((record) => record.companyId === companyId);
}

export function calculateStockBalances(stockEntries, companyId = "all") {
  const balances = new Map();

  filterByCompany(stockEntries, companyId).forEach((entry) => {
    const key = `${entry.companyId}:${entry.itemName}:${entry.category}:${entry.unit}`;
    const existing = balances.get(key) || {
      id: key,
      companyId: entry.companyId,
      itemName: entry.itemName,
      category: entry.category,
      quantity: 0,
      unit: entry.unit
    };
    const multiplier = entry.direction === "in" ? 1 : -1;
    existing.quantity += multiplier * toNumber(entry.quantity);
    balances.set(key, existing);
  });

  return Array.from(balances.values()).map((balance) => ({
    ...balance,
    quantity: roundCurrency(balance.quantity)
  }));
}

export function calculateSummary(state, companyId = "all") {
  const purchases = filterByCompany(state.purchases, companyId);
  const sales = filterByCompany(state.sales, companyId);
  const expenses = filterByCompany(state.expenses, companyId);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + toNumber(purchase.total), 0);
  const totalSales = sales.reduce((sum, sale) => sum + toNumber(sale.total), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);
  const totalSalaries = filterByCompany(state.salaries, companyId).reduce((sum, salary) => sum + toNumber(salary.amountPaid), 0);
  const mineralProfit = filterByCompany(state.minerals, companyId)
    .filter((mineral) => mineral.status === "sold")
    .reduce((sum, mineral) => sum + toNumber(mineral.profit), 0);
  const netProfit = totalSales - totalPurchases - totalExpenses - totalSalaries + mineralProfit;

  return {
    totalPurchases: roundCurrency(totalPurchases),
    totalSales: roundCurrency(totalSales),
    totalExpenses: roundCurrency(totalExpenses),
    totalSalaries: roundCurrency(totalSalaries),
    mineralProfit: roundCurrency(mineralProfit),
    netProfit: roundCurrency(netProfit),
    closingBalance: roundCurrency(netProfit)
  };
}

export function buildReportRows(state, companyId = "all") {
  const summary = calculateSummary(state, companyId);
  const companyLabel = companyId === "all" ? "All Entities" : COMPANIES.find((company) => company.id === companyId)?.name || companyId;

  return {
    profitAndLoss: [
      { id: "sales", account: "Sales Revenue", amount: summary.totalSales },
      { id: "purchases", account: "Purchases", amount: -summary.totalPurchases },
      { id: "expenses", account: "Operating Expenses", amount: -summary.totalExpenses },
      { id: "salaries", account: "Staff Salaries", amount: -summary.totalSalaries },
      { id: "minerals", account: "Mineral Specimen Profit", amount: summary.mineralProfit },
      { id: "net", account: "Net Profit", amount: summary.netProfit }
    ],
    salesSummary: filterByCompany(state.sales, companyId).map((sale) => ({
      id: sale.id,
      date: sale.date,
      invoiceNo: sale.invoiceNo,
      buyer: sale.buyer,
      item: sale.item,
      amount: sale.total
    })),
    closingBalance: [
      {
        id: `${companyId}-closing`,
        entity: companyLabel,
        totalSales: summary.totalSales,
        totalPurchases: summary.totalPurchases,
        totalExpenses: summary.totalExpenses,
        totalSalaries: summary.totalSalaries,
        mineralProfit: summary.mineralProfit,
        netProfit: summary.netProfit,
        closingBalance: summary.closingBalance
      }
    ]
  };
}

export function formatMoney(value) {
  return `Rs ${roundCurrency(toNumber(value)).toLocaleString("en-PK")}`;
}
