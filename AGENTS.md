# Gems & Minerals Accounting App — Project Plan

> A luxurious, AI-powered accounting system for gems, minerals, and raw material trading businesses, with an Urdu voice chatbot powered by Google Gemini 3 Pro and ElevenLabs.

---

## 1. App Overview

A mobile and web application that handles the full financial lifecycle of a gems and minerals business — from raw material purchasing through cutting, polishing, lab testing, shipping, and final sale — with real-time stock management, profit tracking, staff payroll, and an AI voice assistant that understands and responds in Urdu.

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

### 2.7 Urdu Voice Chatbot
- Speak a question in Urdu (e.g. "اس مہینے کی آمدنی کتنی ہے؟")
- The assistant receives live business data context
- The assistant responds with accurate financial answers in the user's language style

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

### AI & Voice
| Technology | Purpose |
|---|---|
| Google Gemini 3 Pro | AI chatbot — understands and answers in Urdu |
| Gemini Live API | Live speech input and spoken responses |

### Export & Utilities
| Technology | Purpose |
|---|---|
| react-native-html-to-pdf | PDF invoice and report generation |
| SheetJS (xlsx) | Excel export of financial data |
| expo-av | Microphone access and audio playback |
| Expo Notifications | Push notification reminders |
| EAS Build | App Store and Play Store deployment |

---

## 4. Luxury Theme

The UI follows a dark luxury aesthetic inspired by premium jewelry and gem trading.

```
Background:       #0A0A0A   (near black)
Card surfaces:    #1A1A2E   (deep navy)
Primary accent:   #D4AF37   (gold)
Secondary accent: #9B59B6   (royal purple)
Text primary:     #F5F5DC   (cream / ivory)
Text muted:       #A89060   (aged gold)
Danger:           #C0392B   (deep red)
Success:          #1ABC9C   (emerald)
```

Fonts: Use a serif for headings (Cormorant Garamond or Playfair Display) and a clean sans-serif for data (Inter or DM Sans). For Urdu text use **Noto Nastaliq Urdu** or **Jameel Noori Nastaleeq**.

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
  /voice.jsx               ← Urdu voice chatbot screen
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
  /voice
    VoiceButton.jsx        ← Mic button with animation
    ChatBubble.jsx         ← Voice conversation display (RTL Urdu support)

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
  useVoiceChat.js          <- Voice conversation state
  useStock.js
  useRevenue.js
  useProfitSummary.js

/services
  supabase.js              ← Supabase client
  gemini.js                ← Gemini 3 Pro API wrapper
  geminiLive.js            <- Gemini Live voice session settings

/theme
  colors.js
  typography.js
  spacing.js
```

---

## 7. Urdu Voice Chatbot — Integration Flow

```
1. User presses mic button on voice screen
2. App opens a live voice session
4. Conversation text and live business data are used for financial answers
5. The assistant speaks the response through the live audio stream
```

Example system prompt for Gemini 3 Pro:
```
You are a financial assistant for a gems and minerals trading business.
The user will ask questions in Urdu. Always answer only in Urdu.
Today's date is {date}.
This month's revenue: {revenue}
This month's expenses: {expenses}
Current stock value: {stock_value}
Net profit this month: {net_profit}
Answer accurately, briefly, and in natural Urdu.
```

Example Urdu queries the chatbot will handle:
- "اس مہینے کی آمدنی کتنی ہے؟" — What is this month's revenue?
- "ابھی کتنا سٹاک باقی ہے؟" — How much stock is remaining?
- "اس مہینے کا منافع کیا ہے؟" — What is this month's profit?
- "ملازمین کی تنخواہ کتنی ہے؟" — What is the staff salary total?

---

## 8. Two-Company Purchase Separation

Every financial record includes a `company_id` field:

| ID | Entity | Description |
|---|---|---|
| 1 | Company | Business entity |
| 2 | Self | Personal / owner account |

The dashboard will display three tabs or a dropdown to switch between entities. Reports can be generated per entity or combined.

---

## 9. Development Phases

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

### Phase 4 — AI Voice Chatbot (Weeks 8–9)
- [ ] Gemini-backed financial context with live DB data
- [ ] Voice chatbot UI screen with RTL chat bubbles

### Phase 5 — Polish & Deploy (Week 10)
- [ ] UI/UX polish and luxury animations
- [ ] Dashboard charts and KPIs
- [ ] Testing on iOS and Android devices
- [ ] EAS Build → App Store + Play Store submission

---

## 10. Estimated API Costs (Monthly)

| Service | Estimated Usage | Cost |
|---|---|---|
| Google Gemini 3 Pro | ~500 voice queries/month | ~$5–10 |
| Gemini Live API | ~500 voice minutes/month | Google AI pricing dependent |
| Supabase | Small business usage | Free tier or $25/month |
| **Total** | | **~$13–46/month** |

---

## 11. Deployment

- **Mobile**: EAS Build → `.ipa` (App Store) + `.apk/.aab` (Play Store)
- **Web**: Expo Web → hosted on Vercel or Netlify
- **Backend**: Supabase cloud (managed, no server required)
- **Updates**: Expo OTA updates (no re-submission for JS changes)

### Current Supabase Assistant Deployment

- Project ref: `hyjfqsxavrykjzmaaasd`
- Deployed Edge Functions: `urdu-gemini-assistant`, `gemini-live-token`, `urdu-elevenlabs-tts`
- Secrets uploaded from `.env` using `npx.cmd supabase secrets set --env-file .env --project-ref hyjfqsxavrykjzmaaasd`
- Verified on June 12, 2026 with `node scripts/check-assistant.js`
- If Windows cannot find `supabase`, use `npx.cmd supabase ...`
- `WARNING: Docker is not running` is acceptable for hosted deploys when the CLI still reports `Deployed Functions`.

---

*Plan version 1.2 — Updated: Urdu voice (ur-PK), Google Gemini 3 Pro latest model, ElevenLabs TTS*

