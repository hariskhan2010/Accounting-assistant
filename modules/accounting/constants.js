export const COMPANIES = [
  { id: "company-a", name: "Company", type: "company" },
  { id: "self", name: "Self", type: "self" }
];

export const COMPANY_FILTERS = [{ id: "all", name: "All Entities", type: "all" }, ...COMPANIES];

export const STOCK_CATEGORIES = [
  { key: "raw", label: "Raw Materials" },
  { key: "polished", label: "Polished Gems" },
  { key: "specimen", label: "Mineral Specimens" }
];

export const EXPENSE_TYPES = [
  { key: "cutting", label: "Cutting" },
  { key: "polishing", label: "Polishing" },
  { key: "lab_testing", label: "Lab Testing" },
  { key: "shipping_out", label: "Shipping Outgoing" },
  { key: "shipping_in", label: "Shipping Incoming" },
  { key: "rent", label: "Rent" },
  { key: "utility", label: "Utility" },
  { key: "daily", label: "Daily Miscellaneous" }
];

export const UNITS = ["ct", "kg", "g", "pcs", "lot"];

export const MINERAL_STATUSES = [
  { key: "in_stock", label: "In Stock" },
  { key: "sold", label: "Sold" },
  { key: "archived", label: "Archived" }
];

export const SALARY_STATUSES = [
  { key: "pending", label: "Pending" },
  { key: "partial", label: "Partial" },
  { key: "paid", label: "Paid" }
];

export function getCompanyName(companyId) {
  if (companyId === "company-b") return "Company";
  return COMPANIES.find((company) => company.id === companyId)?.name || "Unknown";
}

export function getExpenseTypeLabel(type) {
  return EXPENSE_TYPES.find((expenseType) => expenseType.key === type)?.label || type;
}

export function getStockCategoryLabel(category) {
  return STOCK_CATEGORIES.find((stockCategory) => stockCategory.key === category)?.label || category;
}

export function getMineralStatusLabel(status) {
  return MINERAL_STATUSES.find((mineralStatus) => mineralStatus.key === status)?.label || status;
}

export function getSalaryStatusLabel(status) {
  return SALARY_STATUSES.find((salaryStatus) => salaryStatus.key === status)?.label || status;
}
