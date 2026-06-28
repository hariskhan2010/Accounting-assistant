# Help — Aap Ka Kaam (Step by Step)

---

## Step 1: SQL Migration Deploy

**Supabase Dashboard se karo:**

1. Browser mein kholo: https://supabase.com/dashboard/project/hyjfqsxavrykjzmaaasd
2. Left side **"SQL Editor"** pe click karo
3. **"New Query"** button dabao
4. File `supabase/migrations/004_ebay_etsy_integration.sql` ko Notepad mein kholo
5. Sari SQL copy karo
6. Editor mein paste karo
7. **"Run"** button dabao
8. ✅ Success message aana chahiye

---

## Step 2: Edge Functions Deploy

PowerShell mein ye commands run karo:

```powershell
npx supabase functions deploy ebay-webhook --project-ref hyjfqsxavrykjzmaaasd
npx supabase functions deploy etsy-webhook --project-ref hyjfqsxavrykjzmaaasd
```

**Agar `npx supabase` kaam nahi karta:**
```powershell
npx.cmd supabase functions deploy ebay-webhook --project-ref hyjfqsxavrykjzmaaasd
npx.cmd supabase functions deploy etsy-webhook --project-ref hyjfqsxavrykjzmaaasd
```

**Verify karo — yeh command do:**
```powershell
npx supabase functions list --project-ref hyjfqsxavrykjzmaaasd
```

List mein `ebay-webhook` aur `etsy-webhook` dono dikhne chahiye.

---

## Step 3: App Test (Web)

```powershell
npx expo start --web
```

Browser mein `http://localhost:8081` kholo.

### Test 1 — Stock Barcode Entry
1. **Stock** tab pe jao
2. **"New Barcode Entry"** gold button dabao
3. Form fill karo:
   - Type: **Investor** ya **Company**
   - Name: koi bhi naam
   - Gem Type: `Ruby`
   - Weight: `5.50`
   - Buy/Shipping/Sell price: kuch bhi
4. **"Generate Stock ID & Barcode"** dabao
5. ✅ Barcode + IDs dikhne chahiye (INV-XXXXX / INVP-XXXXX jese, numbers har baar alag honge)
6. **"Save to Stock"** dabao
7. ✅ Alert aaye "Saved"

### Test 2 — Orders Tab
1. Neeche **Orders** tab dabao
2. ✅ Stats dikhe: Total 0, Pending 0, Shipped 0, Revenue $0
3. ✅ "No orders yet" ka message dikhe
4. **"Connect Platforms"** link dabao → Settings page khule done

### Test 3 — Settings Page
1. Settings page mein **eBay** section ho → Client ID / Secret fields hon
2. **Etsy** section ho → API Key / Secret fields hon
3. **"Open eBay Developer"** button kaam kare (link khule)
4. **"Open Etsy Developer"** button kaam kare (link khule)

---

## Step 4: eBay Manual Setup (1 time)

1. https://developer.ebay.com pe jao
2. Account banao / login karo
3. **"Create an App"** dabao
4. App details fill karo, **Production** mode select karo
5. **Client ID** aur **Client Secret** copy karo
6. **Notifications** section mein webhook URL daalo:
   ```
   https://hyjfqsxavrykjzmaaasd.supabase.co/functions/v1/ebay-webhook
   ```
7. **Order events** subscribe karo
8. Apne app mein Settings → eBay Connection mein Client ID + Secret paste karo

---

## Step 5: Etsy Manual Setup (1 time)

1. https://developers.etsy.com pe jao
2. **"Create an App"** dabao
3. App name do, **Production** select karo
4. **API Key** aur **API Secret** copy karo
5. Webhook URL set karo:
   ```
   https://hyjfqsxavrykjzmaaasd.supabase.co/functions/v1/etsy-webhook
   ```
6. Apne app mein Settings → Etsy Connection mein API Key + Secret paste karo

---

## Step 6: Live End-to-End Test

```
1. App mein Stock → New Barcode Entry → INV-001 generate karo
2. Gem ko physically barcode label print karo
3. Gem ki photo lo + details lo
4. eBay/Etsy pe manually listing banao
   ⚠️ IMPORTANT: SKU field mein "INV-001" type karo
5. Customer order kare (ya fake order banake test karo)
6. Webhook fire hoga → order Orders tab mein aayega
7. Order card mein hoga:
   - Barcode (top)
   - eBay/Etsy badge
   - Customer name, email, phone, address
   - Amount
8. "Mark Shipped" dabao → status update ho
```

**Fake order manually database mein dalne ka tareeqa:**
Supabase SQL Editor mein yeh run karo:
```sql
insert into orders (platform, platform_order_id, stock_id, customer_name, customer_email, customer_phone, shipping_address, order_amount, status)
values ('ebay', 'EBAY-TEST-001', 'INV-001', 'John Smith', 'john@email.com', '+1-555-0123', '{"addressLine1":"123 Main St","city":"New York","state":"NY","postalCode":"10001","country":"US"}', 2500.00, 'pending');
```

Phir app mein Orders tab refresh karo → order dikhna chahiye.

---

## Step 7: Production Deploy

### Web Deploy (Vercel)
```powershell
npm i -g vercel
vercel --prod
```
Ya GitHub repo ko Vercel se connect karo.

### Mobile Deploy (EAS Build)
```powershell
npm i -g eas-cli
eas login
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Env Variables (Vercel dashboard pe set karo)
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
EBAY_CLIENT_ID
EBAY_CLIENT_SECRET
EBAY_WEBHOOK_VERIFICATION_TOKEN
ETSY_API_KEY
ETSY_API_SECRET
```

---

## Quick Reference

| Step | Time | Done? |
|------|------|-------|
| Step 1: SQL Migration | 2 min | ☐ |
| Step 2: Deploy Edge Functions | 2 min | ☐ |
| Step 3: App Test | 10 min | ☐ |
| Step 4: eBay Setup | 20 min | ☐ |
| Step 5: Etsy Setup | 20 min | ☐ |
| Step 6: Live Test | 15 min | ☐ |
| Step 7: Production Deploy | 10 min | ☐ |

---

**Total time: ~1.5 hours**
