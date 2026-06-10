# Phase 2 - Core Accounting

Estimated duration: Weeks 3-5.

## Goal

Implement the transaction workflows that run the daily accounting operation: purchases, sales, stock movement, expenses, invoices, and closing balance.

## Scope

- Purchase entry with Company and Self separation.
- Sale entry with buyer details.
- Invoice number generation.
- Invoice PDF generation.
- Stock inward and outward entries.
- Stock categories for raw, polished, and specimen items.
- Expense entry for all planned expense types.
- Closing balance calculation by day, month, and year.
- Profit calculation per transaction and period.
- Dashboard totals for sales, purchases, expenses, stock value, and net profit.

## Purchase Workflow

- Select company entity.
- Enter item, quantity, unit, unit price, total, date, and notes.
- Create linked stock inward entry.
- Include purchase in closing balance and profit calculations.

## Sale Workflow

- Select company entity.
- Enter item, quantity, unit price, buyer, date, and invoice number.
- Create linked stock outward entry.
- Generate invoice PDF.
- Include sale in revenue, stock, and profit calculations.

## Expense Workflow

Supported expense types:

- Cutting
- Polishing
- Lab testing
- Shipping outgoing
- Shipping incoming
- Rent
- Utility
- Daily miscellaneous

## Stock Workflow

- Record inward stock from purchases.
- Record outward stock from sales.
- Show remaining balance by item and category.
- Support raw materials, polished gems, and mineral specimens.
- Allow date-based closing stock views.

## Deliverables

- Purchase service and screens.
- Sale service and screens.
- Expense service and screens.
- Stock service and stock overview.
- Invoice PDF generation.
- Closing balance service.
- Dashboard KPI data source.

## Acceptance Criteria

- Purchases increase stock and purchase totals for the selected entity.
- Sales reduce stock and increase revenue for the selected entity.
- Expenses reduce net profit and closing balance.
- Profit can be calculated per sale and per period.
- Reports and dashboard data can be filtered by Company, Self, or all entities.
- Stock cannot silently become negative without an explicit override path.

