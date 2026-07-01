# Gems & Minerals Accounting App — Project Plan

---

## 1. App Overview

A mobile and web application that handles the full financial lifecycle of a gems and minerals business — from raw material purchasing through cutting, polishing, lab testing, shipping, and final sale — with real-time stock management, profit tracking, and staff payroll.

---

## 2. Feature Modules

### 2.1 Purchase & Sale
- Record purchases of raw materials (one company + self)
- Record sales with buyer details and invoice generation
- Calculate profit per transaction and per period
- Support for one company account and personal account

### 2.2 Stock & Balance
- Live stock entry (inward and outward)
- Balance stock at any point in time
- Separate stock tracking for raw materials, polished gems, and mineral specimens
- Closing balance per day / month / year

### 2.3 Expenses Tracking
- Cutting and polishing charges
- Lab testing / certification charges
- Shipping expenses (outgoing)
- Shipping expenses from other sites (incoming)
- Rent of shop
- Utilities
- Daily miscellaneous expenses

### 2.4 Minerals Specimen Module
- Separate purchase and sale tracking for mineral specimens
- Profit calculation per specimen or batch
- Stock management for specimens

### 2.5 Staff & Salaries
- Staff profiles and designation
- Monthly salary records
- Salary payment history and status

### 2.6 Reports & Closing Balance
- Monthly and annual profit & loss
- Total sales summary
- Closing balance report
- Per-company financial breakdown
- Export to PDF and Excel

---

## 3. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React Native + Expo SDK 52 | Cross-platform app (iOS, Android, Web) |
| Expo Router | File-based navigation |
| NativeWind (Tailwind CSS) | Styling and luxury theme |
| React Native Reanimated | Smooth animations |
| Victory Native XL | Charts and data visualization |
| react-native-vector-icons | Icons throughout the UI |

### Backend
| Technology | Purpose |
|---|---|
| Supabase | PostgreSQL database, auth, storage, edge functions |
| Supabase Auth | OTP-based login and role management |
| Supabase Storage | Invoice PDFs, product photos |
| Supabase Edge Functions | Custom server logic if needed |

### Export & Utilities
| Technology | Purpose |
|---|---|
| react-native-html-to-pdf | PDF invoice and report generation |
| SheetJS (xlsx) | Excel export of financial data |
| expo-av | Microphone access and audio playback |
| Expo Notifications | Push notification reminders |
| EAS Build | App Store and Play Store deployment |

---

## 4. Luxury Theme — Modern Dark (Cinema Mobile)

The UI follows a cinematic dark luxury aesthetic inspired by premium jewelry and gem trading. All design decisions should reference the **UI/UX Pro Max** and **Frontend Design** skills.

### Design Tokens

```
Background:       #15151F   (dark navy-charcoal — warm, not harsh)
Background deep:  #0D0D14   (deepest)
Card surfaces:    #1E1E32   (deep navy with warm undertone)
Card muted:       #282840
Card elevated:    #353550
Primary accent:   #D4AF37   (gold — CTAs, active states)
Secondary accent: #E8C766   (honey-gold — badges, highlights)
Accent:           #9B59B6   (royal purple)
Accent light:     #C084FC
Text primary:     #EDE8D0   (warm cream / ivory)
Text muted:       #C8A870   (warm gold)
Text dim:         #6B5D3A   (dark gold)
Danger:           #E07856   (warm coral)
Success:          #7FB069   (soft sage)
Warning:          #F0B34B   (warm amber)
Border:           rgba(212,175,55,0.12)  (soft gold hairline)
Card shadow:      rgba(212,175,55,0.08)  (gold-tinted glow)
Tab bar:          rgba(21,21,31,0.85)
```

### Typography
| Role | Font | Weight |
|------|------|--------|
| Display / Hero | Cormorant 34px | 700 |
| Heading | Cormorant 22px | 700 |
| Subheading | Cormorant 18px | 600 |
| Body | Montserrat 15px | 400 |
| Label / Data | Montserrat 12-14px | 500-600 |


### UI Conventions (from UI/UX Pro Max — Modern Dark)
- `borderRadius: 16` on all cards and sheets (min `12`, max `20`)
- Borders use `StyleSheet.hairlineWidth` with `rgba(212,175,55,0.12)`
- Animated ambient glow (2–3 blobs, Reanimated, opacity 0.08–0.12)
- BlurView headers/tab bar (intensity 20, dark tint)
- Spring animations: `damping: 20, stiffness: 90`
- Scale press: `0.97 → 1.0` on all Pressables
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`
- Haptic feedback on every Pressable (expo-haptics)
- No pure `#000000` (use `#020203` deep instead)
- Tab bar: translucent with `rgba(10,10,10,0.85)` + hairline top border

### Signature Element (from Frontend Design)
"Ground it in the subject" — gemstone geometries, gold foil textures, mineral crystallography patterns as ambient decorative elements. The one memorable thing: **animated gemstone crest** on dashboard with ambient gold particle system.

---

## 5. Database Schema (Key Tables)

```sql
-- Companies / entities
companies (id, name, type)               -- Company, Self

-- Purchases
purchases (id, company_id, date, item, quantity, unit, unit_price, total, notes)

-- Sales
sales (id, company_id, date, item, quantity, unit_price, total, buyer, invoice_no)

-- Expenses
expenses (id, date, type, amount, description)
-- type: cutting | polishing | lab_testing | shipping_out | shipping_in | rent | utility | daily

-- Stock
stock_entries (id, date, item_name, category, direction, quantity, unit, reference_id)
-- category: raw | polished | specimen
-- direction: in | out

-- Minerals specimens
minerals (id, date, name, purchase_price, sale_price, status, profit)

-- Staff
staff (id, name, designation, monthly_salary, join_date)
salaries (id, staff_id, month, year, amount_paid, payment_date, status)

-- Closing balance
closing_balance (id, period, opening_balance, total_sales, total_purchases, total_expenses, net_profit, closing_balance)
```

---

## 6. Project Folder Structure

```
/app
  /(auth)
    login.jsx              ← OTP login screen
  /(tabs)
    index.jsx              ← Dashboard / home
    stock.jsx              ← Stock overview
    sales.jsx              ← Sales list and entry
    expenses.jsx           ← Expenses entry
    reports.jsx            ← Monthly/annual reports
  /purchase/[id].jsx       ← Purchase detail
  /sale/[id].jsx           ← Sale detail

/components
  /ui
    Card.jsx               ← Luxury card component
    GoldButton.jsx         ← Primary CTA button
    StatBox.jsx            ← KPI stat display
    DataTable.jsx          ← Financial data table
  /charts
    RevenueChart.jsx
    StockChart.jsx
    ProfitChart.jsx
/modules
  /accounting
    purchaseService.js
    saleService.js
    balanceService.js
  /expenses
    expenseService.js
  /minerals
    mineralService.js
  /staff
    staffService.js
    salaryService.js
  /reports
    pdfExport.js
    excelExport.js

/hooks
  useStock.js
  useRevenue.js
  useProfitSummary.js

/services
  supabase.js              ← Supabase client

/theme
  colors.js
  typography.js
  spacing.js
```

---

## 7. Two-Company Purchase Separation

Every financial record includes a `company_id` field:

| ID | Entity | Description |
|---|---|---|
| 1 | Company | Business entity |
| 2 | Self | Personal / owner account |

The dashboard will display three tabs or a dropdown to switch between entities. Reports can be generated per entity or combined.

---

## 8. Development Phases

### Phase 1 — Foundation (Weeks 1–2)
- [ ] Set up Supabase project and design full database schema
- [ ] Scaffold Expo app with luxury theme (colors, fonts, base components)
- [ ] Implement authentication (OTP login via Supabase Auth)
- [ ] Build navigation structure (Expo Router tabs)
- [ ] Add RTL (right-to-left) support for Urdu text

### Phase 2 — Core Accounting (Weeks 3–5)
- [ ] Purchase entry (with company/self separation)
- [ ] Sale entry and invoice generation
- [ ] Stock entry (inward/outward, categories)
- [ ] Expenses module (all 7 expense types)
- [ ] Closing balance calculation

### Phase 3 — Extended Modules (Weeks 6–7)
- [ ] Minerals specimen module
- [ ] Staff and salary management
- [ ] Profit & Loss reports
- [ ] PDF and Excel export

### Phase 4 — Polish & Deploy (Week 10)
- [ ] UI/UX polish and luxury animations
- [ ] Dashboard charts and KPIs
- [ ] Testing on iOS and Android devices
- [ ] EAS Build → App Store + Play Store submission

---

## 9. Estimated Costs (Monthly)

| Service | Usage | Cost |
|---|---|---|
| Supabase | Small business usage | Free tier or $25/month |
| **Total** | | **~$0–25/month** |

---

## 10. Deployment

- **Mobile**: EAS Build → `.ipa` (App Store) + `.apk/.aab` (Play Store)
- **Web**: Expo Web → hosted on Vercel or Netlify
- **Backend**: Supabase cloud (managed, no server required)
- **Updates**: Expo OTA updates (no re-submission for JS changes)

*Plan version 2.0 — Voice assistant removed*

