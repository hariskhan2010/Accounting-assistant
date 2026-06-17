import { loadAccountingState } from "@/modules/accounting/localAccountingStore";
import { calculateStockBalances, calculateSummary, formatMoney } from "@/modules/accounting/localAccountingStore";
import { getCompanyName, getExpenseTypeLabel } from "@/modules/accounting/constants";
import { createPurchase } from "@/modules/accounting/purchaseService";
import { createSale } from "@/modules/accounting/saleService";
import { createExpense } from "@/modules/expenses/expenseService";
import { createMineral } from "@/modules/minerals/mineralService";
import { createStaff } from "@/modules/staff/staffService";
import { createSalary } from "@/modules/staff/salaryService";

function entitySummary(entity) {
  return entity ? ` (${getCompanyName(entity)})` : "";
}

function buildSuccessMessage(intent, params) {
  const entity = entitySummary(params.companyId);
  const amount = params.amount ? `Rs ${params.amount.toLocaleString("en-PK")}` : "";

  switch (intent) {
    case "add_purchase":
      return `Purchase added${entity}: ${params.item || "item"} x${params.quantity} ${params.unit} for ${amount}`;
    case "add_sale":
      return `Sale added${entity}: ${params.item || "item"} x${params.quantity} ${params.unit} for ${amount}`;
    case "add_expense":
      return `Expense added${entity}: ${getExpenseTypeLabel(params.expenseType) || "General"} — ${amount}`;
    case "add_mineral":
      return `Mineral added${entity}: ${params.item || "specimen"} for ${amount}`;
    case "add_staff":
      return `Staff added${entity}: ${params.staffName || "New staff"} as ${params.designation}`;
    case "pay_salary":
      return `Salary paid${entity}: ${params.staffName || "staff"} — ${params.month}/${params.year}`;
    default:
      return `Done${entity}`;
  }
}

function buildErrorMessage(intent, params) {
  switch (intent) {
    case "add_purchase":
      return "Could not add purchase. Need item name and amount. Try 'add purchase of diamonds for Rs 5000'";
    case "add_sale":
      return "Could not add sale. Need item name and amount. Try 'add sale of gold for Rs 10000'";
    case "add_expense":
      return "Could not add expense. Need amount. Try 'add expense of Rs 2000 for cutting'";
    case "add_mineral":
      return "Could not add mineral. Need name and price. Try 'add mineral ruby for Rs 30000'";
    case "add_staff":
      return "Could not add staff. Need name. Try 'add staff Ahmed as cutter'";
    case "pay_salary":
      return "Could not pay salary. Try 'pay salary of Rs 15000 for Ahmed'";
    default:
      return "I couldn't understand the command. Please try again with clearer details.";
  }
}

function validateParams(intent, params) {
  const requiredMap = {
    add_purchase: ["item", "amount"],
    add_sale: ["item", "amount"],
    add_expense: ["amount"],
    add_mineral: ["item", "amount"],
    add_staff: ["staffName"],
    pay_salary: ["staffName", "amount"]
  };

  const required = requiredMap[intent] || [];
  const missing = required.filter((key) => !params[key]);
  return missing;
}

export async function executeAction(command) {
  const { intent, params } = command;
  const missing = validateParams(intent, params);

  if (missing.length > 0) {
    return {
      success: false,
      message: buildErrorMessage(intent, params),
      intent,
      params,
      missing
    };
  }

  try {
    switch (intent) {
      case "add_purchase": {
        const result = await createPurchase({
          companyId: params.companyId || "self",
          date: params.date,
          item: params.item || "Item",
          category: params.category || "raw",
          quantity: params.quantity || 1,
          unit: params.unit || "pcs",
          unitPrice: params.amount / (params.quantity || 1),
          notes: `Via voice: ${params.raw}`
        });
        if (result.error) throw new Error(result.error.message || result.error);
        break;
      }
      case "add_sale": {
        const result = await createSale({
          companyId: params.companyId || "self",
          date: params.date,
          item: params.item || "Item",
          category: params.category || "raw",
          quantity: params.quantity || 1,
          unit: params.unit || "pcs",
          unitPrice: params.amount / (params.quantity || 1),
          buyer: params.buyer || "Cash Sale",
          allowNegativeStock: true
        });
        if (result.error) throw new Error(result.error.message || result.error);
        break;
      }
      case "add_expense": {
        const result = await createExpense({
          companyId: params.companyId || "self",
          date: params.date,
          type: params.expenseType || "daily",
          amount: params.amount || 0,
          description: params.description || "Via voice assistant"
        });
        if (result.error) throw new Error(result.error.message || result.error);
        break;
      }
      case "add_mineral": {
        const result = await createMineral({
          companyId: params.companyId || "self",
          date: params.date,
          name: params.item || "Specimen",
          purchasePrice: params.amount || 0,
          salePrice: "",
          status: "in_stock"
        });
        if (result.error) throw new Error(result.error.message || result.error);
        break;
      }
      case "add_staff": {
        const result = await createStaff({
          companyId: params.companyId || "self",
          name: params.staffName || "Staff",
          designation: params.designation || "Worker",
          monthlySalary: params.amount || 0,
          joinDate: params.date
        });
        if (result.error) throw new Error(result.error.message || result.error);
        break;
      }
      case "pay_salary": {
        const state = await loadAccountingState();
        const staffMatch = state.staff.find(
          (s) => s.name.toLowerCase().includes((params.staffName || "").toLowerCase())
        );
        if (!staffMatch) {
          return {
            success: false,
            message: `Could not find staff named "${params.staffName}". Available staff: ${state.staff.map((s) => s.name).join(", ")}`,
            intent,
            params
          };
        }
        const result = await createSalary({
          companyId: params.companyId || staffMatch.companyId || "self",
          staffId: staffMatch.id,
          month: params.month || new Date().getMonth() + 1,
          year: params.year || new Date().getFullYear(),
          amountPaid: params.amount || staffMatch.monthlySalary,
          status: "paid"
        });
        if (result.error) throw new Error(result.error.message || result.error);
        break;
      }
      default:
        return { success: false, message: "Unknown action.", intent, params };
    }

    return {
      success: true,
      message: buildSuccessMessage(intent, params),
      intent,
      params
    };
  } catch (error) {
    return {
      success: false,
      message: `Sorry, there was an error: ${error.message}`,
      intent,
      params,
      error: error.message
    };
  }
}

export async function executeQuery(command) {
  const { intent, params } = command;
  const companyId = params?.companyId || "all";
  const entity = companyId === "all" ? "All entities" : getCompanyName(companyId);

  try {
    const state = await loadAccountingState();
    const summary = calculateSummary(state, companyId);
    const stocks = calculateStockBalances(state.stockEntries, companyId);

    switch (intent) {
      case "check_stock": {
        const totalQty = stocks.reduce((s, item) => s + Number(item.quantity || 0), 0);
        const topItems = stocks.slice(0, 5).map((s) => `${s.itemName} (${s.quantity} ${s.unit})`).join(", ");
        return {
          success: true,
          message: `${entity}: Total stock ${totalQty} units. ${topItems ? "Top items: " + topItems : "No stock entries found."}`
        };
      }
      case "check_revenue": {
        return {
          success: true,
          message: `${entity}: Total revenue is ${formatMoney(summary.totalSales)}`
        };
      }
      case "check_profit": {
        return {
          success: true,
          message: `${entity}: Net profit is ${formatMoney(summary.netProfit)}. (Revenue ${formatMoney(summary.totalSales)}, Purchases ${formatMoney(summary.totalPurchases)}, Expenses ${formatMoney(summary.totalExpenses)})`
        };
      }
      case "check_balance": {
        return {
          success: true,
          message: `${entity}: Closing balance is ${formatMoney(summary.closingBalance)}`
        };
      }
      case "check_expenses": {
        return {
          success: true,
          message: `${entity}: Total expenses are ${formatMoney(summary.totalExpenses)}`
        };
      }
      default:
        return { success: true, message: "I can help with stock, revenue, profit, and balance queries." };
    }
  } catch (error) {
    return { success: false, message: `Sorry, error fetching data: ${error.message}` };
  }
}
