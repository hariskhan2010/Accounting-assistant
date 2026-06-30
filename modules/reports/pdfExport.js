import { Platform } from "react-native";
import * as Print from "expo-print";
import { getCompanyName } from "@/modules/accounting/constants";
import { formatMoney } from "@/modules/accounting/localAccountingStore";
import { downloadTextAsFile, isWeb } from "./downloadWeb";

export function buildInvoiceHtml(sale) {
  const total = formatMoney(sale.total);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { background: #ffffff; color: #111111; font-family: Arial, sans-serif; padding: 32px; }
          h1 { color: #111111; margin-bottom: 4px; }
          .muted { color: #666666; }
          .meta { margin: 24px 0; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border-bottom: 1px solid #dddddd; padding: 12px; text-align: left; }
          th { background: #f5f5f5; }
          .total { font-size: 20px; font-weight: 700; text-align: right; }
        </style>
      </head>
      <body>
        <h1>Invoice ${sale.invoiceNo}</h1>
        <div class="muted">Gems and Minerals Accounting</div>
        <div class="meta">
          <div><strong>Date:</strong> ${sale.date}</div>
          <div><strong>Entity:</strong> ${getCompanyName(sale.companyId)}</div>
          <div><strong>Buyer:</strong> ${sale.buyer}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${sale.item}</td>
              <td>${sale.quantity} ${sale.unit}</td>
              <td>${formatMoney(sale.unitPrice)}</td>
              <td>${total}</td>
            </tr>
          </tbody>
        </table>
        <p class="total">${total}</p>
      </body>
    </html>
  `;
}

export async function exportInvoicePdf(sale) {
  if (isWeb()) {
    downloadTextAsFile(
      buildInvoiceHtml(sale),
      `invoice-${sale.invoiceNo}.html`,
      "text/html"
    );
    return { uri: null };
  }
  return Print.printToFileAsync({
    html: buildInvoiceHtml(sale)
  });
}

export async function exportReportPdf() {
  throw new Error("Use exportFinancialReportPdf with report rows.");
}

export async function exportFinancialReportPdf({ title, profitAndLoss, salesSummary, closingBalance }) {
  const renderRows = (rows, columns) =>
    rows
      .map(
        (row) =>
          `<tr>${columns
            .map((column) => `<td>${row[column] ?? ""}</td>`)
            .join("")}</tr>`
      )
      .join("");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { color: #111; font-family: Arial, sans-serif; padding: 28px; }
          h1 { margin-bottom: 4px; }
          h2 { margin-top: 28px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <h2>Profit and Loss</h2>
        <table><tbody>${renderRows(profitAndLoss, ["account", "amountLabel"])}</tbody></table>
        <h2>Sales Summary</h2>
        <table><tbody>${renderRows(salesSummary, ["date", "invoiceNo", "buyer", "item", "amountLabel"])}</tbody></table>
        <h2>Closing Balance</h2>
        <table><tbody>${renderRows(closingBalance, ["entity", "totalSalesLabel", "totalPurchasesLabel", "totalExpensesLabel", "totalSalariesLabel", "mineralProfitLabel", "netProfitLabel", "closingBalanceLabel"])}</tbody></table>
      </body>
    </html>
  `;

  if (isWeb()) {
    downloadTextAsFile(
      html,
      `financial-report-${new Date().toISOString().slice(0, 10)}.html`,
      "text/html"
    );
    return { uri: null };
  }

  return Print.printToFileAsync({ html });
}
