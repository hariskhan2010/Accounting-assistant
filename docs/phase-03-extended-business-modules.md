# Phase 3 - Extended Business Modules

Estimated duration: Weeks 6-7.

## Goal

Add the specialized business modules that make the app useful for gems, minerals, and trading operations beyond basic purchase and sale entry.

## Scope

- Mineral specimen purchase and sale tracking.
- Per-specimen or batch profit calculation.
- Specimen stock status.
- Staff profiles.
- Monthly salary records.
- Salary payment history.
- Profit and loss reports.
- Sales summary reports.
- Closing balance reports.
- PDF and Excel export.

## Mineral Specimen Module

Track:

- Specimen name.
- Purchase date.
- Purchase price.
- Sale price.
- Status: in stock, sold, or archived.
- Profit.
- Linked company entity where applicable.

## Staff and Salary Module

Track:

- Staff name.
- Designation.
- Monthly salary.
- Join date.
- Salary month and year.
- Amount paid.
- Payment date.
- Payment status.

## Reporting Module

Build:

- Monthly profit and loss.
- Annual profit and loss.
- Total sales summary.
- Closing balance report.
- Per-company financial breakdown.
- Combined business report.

## Export Module

Support:

- PDF export for invoices and reports.
- Excel export for report tables.
- Stored generated documents in Supabase Storage when needed.

## Deliverables

- Mineral specimen screens and services.
- Staff and salary screens and services.
- Report data services.
- PDF export utility.
- Excel export utility.
- Report filters for date range and company entity.

## Acceptance Criteria

- Specimen profit is visible per item or batch.
- Staff salary totals are included in expense and profit calculations.
- Reports match the underlying purchase, sale, expense, stock, mineral, and salary data.
- PDF and Excel exports contain the same values shown in the app.
- Reports can be generated for Company A, Company B, Self, and all entities.
