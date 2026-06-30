# To-Do List

> **Mera kaam ✅ ho chuka hai** — neeche jo likha hai wo **aapka kaam** hai.

---

## 🔴 Pehle Ye Karo (Aaj)

### 1. SQL Migration Deploy

**Supabase Dashboard se karo (easy):**
1. https://supabase.com/dashboard/project/hyjfqsxavrykjzmaaasd
2. **SQL Editor** mein jao
3. **`supabase/migrations/004_ebay_etsy_integration.sql`** ka sara copy karo
4. Paste karo → Run karo

**Ya command se (agar CLI setup hai):**
```powershell
npx supabase migration up --project-ref hyjfqsxavrykjzmaaasd
```

### 2. Edge Functions Deploy

```powershell
npx supabase functions deploy ebay-webhook --project-ref hyjfqsxavrykjzmaaasd
npx supabase functions deploy etsy-webhook --project-ref hyjfqsxavrykjzmaaasd
```

### 3. App Test Karo

```powershell
npx expo start --web
```

Test karo:
- ✅ Stock tab → "New Barcode Entry" → form fill → Generate barcode → Save
- ✅ Orders tab → empty state dikhe → "Connect Platforms" settings khule
- ✅ Settings page → eBay/Etsy fields dikhein

---

## 🟡 Baad Mein Ye Karo (Jab Time Mile)

### 4. eBay Developer Account

- https://developer.ebay.com pe jao
- App banao → Client ID + Secret lo
- Webhook URL set karo:
  ```
  https://hyjfqsxavrykjzmaaasd.supabase.co/functions/v1/ebay-webhook
  ```
- App Settings mein credentials daalo

### 5. Etsy Developer Account ✅ (Pending Approval)

- ✅ App registered on Etsy
- ✅ API Key: `0w8n936ttk8j1f18p4vu5b2n`
- ✅ Secret: `09pdw1imrj`
- ⏳ **Waiting for Personal Approval** (tomorrow check)
- ⏳ Webhook URL set karna hai approval ke baad:
  ```
  https://hyjfqsxavrykjzmaaasd.supabase.co/functions/v1/etsy-webhook
  ```
- ⏳ App Settings mein credentials paste karna hai

### 6. Full Flow Test

```
Stock entry karo → barcode print karo
eBay/Etsy pe list karo → SKU mein Stock ID daalo
Customer order kare → webhook fire → Orders tab mein aaye
"Mark Shipped" press karo
```

### 7. Production Deploy

- Web: `vercel --prod`
- Mobile: `eas build`
- Env vars dashboard pe set karo

---

## ✅ Jo Main Kar Chuka Hoon

- [x] Database migration file (004)
- [x] eBay webhook Edge Function
- [x] Etsy webhook Edge Function
- [x] Barcode component (CODE128)
- [x] Stock entry form modal
- [x] Orders tab screen
- [x] OrderCard, OrderStats, OrderFilters components
- [x] Settings screen for credentials
- [x] Local storage services (orders + stock items)
- [x] Supabase services (dual mode)
- [x] Navigation mein Orders tab add
- [x] Constants update
- [x] `jsbarcode` package install
- [x] Deploy guide (ebay-etsy-deploy-guide.md)
- [x] Complete work guide (complete-work-guide.md)
