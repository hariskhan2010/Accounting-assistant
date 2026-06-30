import * as XLSX from "xlsx";
import { downloadBase64, isWeb } from "./downloadWeb";

export function buildFinancialReportWorkbook({ profitAndLoss, salesSummary, closingBalance }) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(profitAndLoss), "Profit and Loss");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesSummary), "Sales Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(closingBalance), "Closing Balance");
  return workbook;
}

export async function exportReportExcel(reportData) {
  const workbook = buildFinancialReportWorkbook(reportData);
  const output = XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
  const fileName = `financial-report-${new Date().toISOString().slice(0, 10)}.xlsx`;

  if (isWeb()) {
    downloadBase64(output, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  return { base64: output, fileName };
}
