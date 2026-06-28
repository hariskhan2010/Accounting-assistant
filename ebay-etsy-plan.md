# eBay + Etsy Orders Integration + Barcode System
## Feature Plan for Gems Accounting App
## https://accounting-assistant-cyan.vercel.app/

---

## 1. FEATURE OVERVIEW

**Feature Name:** Orders Integration + Barcode Generator  
**App:** Gems Accounting Assistant  
**Core Value:**
1. Stock entry mein gem details dalo → barcode generate ho (INV/CS)
2. User khud eBay/Etsy pe manually list kare (app se koi connection nahi)
3. Customer order kare → app ke Orders section mein automatically aaye
4. Order card mein: Barcode → Platform name (eBay/Etsy) → Customer details

---

## 2. STOCK ID / PAYMENT ID NAMING

| Type | Stock ID | Payment ID | Example |
|------|----------|------------|---------|
| Investor | INV-001, INV-002... | INVP-001, INVP-002... | INV-047 / INVP-047 |
| Company | CS-001, CS-002... | CP-001, CP-002... | CS-023 / CP-023 |

---

## 3. COMPLETE USER FLOW

```
STEP 1 — Stock Entry (App)
User opens app → Stock Section
Fills details:
  - Type: Investor OR Company
  - Investor Name / Company Name
  - Gem Type, Weight, Size
  - Buy Price, Shipping Price, Sell Price
  - Date
→ System generates Stock ID + Payment ID
→ Barcode generated (CODE128)
→ Clean print label: barcode + Stock ID only
→ Print → stick on gem packet

STEP 2 — Manual Listing (User does this outside app)
User goes to eBay/Etsy manually
Lists the gem themselves
IMPORTANT: User puts Stock ID (INV-001) 
in the eBay/Etsy listing SKU field
This is how app knows which gem was sold

STEP 3 — Customer Orders (Automatic)
Customer buys on eBay/Etsy
→ Webhook fires to app automatically
→ Order appears in Orders section:

┌─────────────────────────────────────┐
│                                     │
│  ▐█▌▐█▐▌█▐██▌█▐▌█▐█▌▐█▌▐█▐▌█▐██▌  │
│             INV-001                 │
│                                     │
│           🛍️  eBay                  │
│  ─────────────────────────────────  │
│  John Smith                         │
│  john@gmail.com                     │
│  +1-555-0123                        │
│  123 Main St, New York, USA         │
│                                     │
│  [Mark Shipped]  [Print Label]      │
└─────────────────────────────────────┘
```

---

## 4. ORDER CARD LAYOUT (Exact Design)

```
Top:      Barcode (full width, CODE128)
          Stock ID below barcode (INV-001)

Middle:   Platform badge (🛍️ eBay OR 🛍️ Etsy)
          Divider line

Bottom:   Customer Name
          Customer Email
          Customer Phone
          Customer Full Address

Actions:  [Mark Shipped]  [Print Label]
```

**No product details on card** — barcode scan karo → stock se details milti hain.

---

## 5. ORDERS SECTION (New Navigation Tab)

```
Dashboard | Stock | Barcodes | Orders ← NEW | Settings
```

### Orders Page:
```
┌──────────┬──────────┬──────────┬──────────┐
│  Total   │ Pending  │ Shipped  │ Revenue  │
│    24    │    5     │   19     │ $12,400  │
└──────────┴──────────┴──────────┴──────────┘

[All] [eBay] [Etsy] [Pending] [Shipped]

[Order Card 1]  [Order Card 2]  [Order Card 3]
[Order Card 4]  [Order Card 5]  [Order Card 6]
```

---

## 6. EBAY WEBHOOK SETUP

### What user needs to do (one time):
1. Go to developer.ebay.com
2. Create app → get Client ID + Secret
3. Set webhook URL: `https://your-app.vercel.app/api/webhooks/ebay`
4. Subscribe to: `MARKETPLACE_ACCOUNT_DELETION` + order events
5. Paste credentials in app Settings → Connect eBay

### Webhook Handler:
```typescript
// app/api/webhooks/ebay/route.ts
export async function POST(req: Request) {
  // 1. Verify eBay signature
  const signature = req.headers.get('x-ebay-signature');
  if (!verifyEbaySignature(signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = await req.json();

  // 2. Extract data
  const orderData = {
    platform: 'ebay',
    platform_order_id: payload.orderId,
    stock_id: payload.lineItems[0].sku, // INV-001 (user put this as SKU)
    customer_name: payload.fulfillmentStartInstructions[0]
      .shippingStep.shipTo.fullName,
    customer_email: payload.buyer.email,
    customer_phone: payload.buyer.phoneNumber || null,
    shipping_address: payload.fulfillmentStartInstructions[0]
      .shippingStep.shipTo.contactAddress,
    order_amount: parseFloat(payload.lineItems[0].lineItemCost.value),
    order_date: new Date().toISOString(),
    status: 'pending',
    raw_payload: payload
  };

  // 3. Save to Supabase
  await supabase.from('orders').insert(orderData);

  return new Response('OK', { status: 200 });
}
```

---

## 7. ETSY WEBHOOK SETUP

### What user needs to do (one time):
1. Go to developers.etsy.com
2. Create app → get API Key
3. Set webhook URL: `https://your-app.vercel.app/api/webhooks/etsy`
4. Paste credentials in app Settings → Connect Etsy

### Webhook Handler:
```typescript
// app/api/webhooks/etsy/route.ts
export async function POST(req: Request) {
  const payload = await req.json();

  const orderData = {
    platform: 'etsy',
    platform_order_id: payload.receipt_id.toString(),
    stock_id: payload.transactions[0].sku, // INV-001 (user put as SKU)
    customer_name: payload.name,
    customer_email: payload.buyer_email,
    customer_phone: null,
    shipping_address: {
      addressLine1: payload.first_line,
      city: payload.city,
      country: payload.country_iso,
      postalCode: payload.zip
    },
    order_amount: payload.total_price / 100,
    order_date: new Date().toISOString(),
    status: 'pending',
    raw_payload: payload
  };

  await supabase.from('orders').insert(orderData);

  return new Response('OK', { status: 200 });
}
```

---

## 8. DATABASE SCHEMA (Supabase)

```sql
-- Stock table
create table if not exists stock (
  id uuid primary key default gen_random_uuid(),
  stock_type text not null,             -- 'investor' | 'company'
  stock_id text unique not null,        -- INV-001 or CS-001
  payment_id text unique not null,      -- INVP-001 or CP-001
  investor_name text,
  company_name text,
  gem_type text not null,
  weight numeric(6,2) not null,
  gem_length numeric(6,2),
  gem_width numeric(6,2),
  buy_price numeric(10,2),
  shipping_price numeric(10,2),
  sell_price numeric(10,2),
  entry_date date default current_date,
  status text default 'available',      -- 'available' | 'sold'
  created_at timestamptz default now()
);

-- Orders table
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  platform text not null,              -- 'ebay' | 'etsy'
  platform_order_id text not null,
  stock_id text references stock(stock_id),
  -- Customer details
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb,
  -- Order info
  order_amount numeric(10,2),
  currency text default 'USD',
  order_date timestamptz,
  status text default 'pending',       -- 'pending' | 'shipped' | 'delivered'
  tracking_number text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

-- Platform credentials
create table if not exists platform_credentials (
  id uuid primary key default gen_random_uuid(),
  platform text not null,              -- 'ebay' | 'etsy'
  access_token text,                   -- encrypted
  refresh_token text,                  -- encrypted
  token_expiry timestamptz,
  is_connected boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_orders_platform on orders(platform);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_stock_id on orders(stock_id);

-- RLS
alter table stock enable row level security;
alter table orders enable row level security;
alter table platform_credentials enable row level security;
```

---

## 9. PROJECT STRUCTURE (additions only)

```
app/
├── (dashboard)/
│   ├── orders/
│   │   └── page.tsx              # Orders section (new)
│   └── settings/
│       └── page.tsx              # Connect eBay/Etsy credentials
├── api/
│   └── webhooks/
│       ├── ebay/route.ts         # eBay webhook receiver
│       └── etsy/route.ts         # Etsy webhook receiver
components/
└── orders/
    ├── OrderCard.tsx             # Barcode + Platform + Customer
    ├── OrderStats.tsx            # Total/Pending/Shipped/Revenue
    └── OrderFilters.tsx          # Filter by platform/status
```

---

## 10. ORDER CARD COMPONENT

```typescript
// components/orders/OrderCard.tsx
import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

export function OrderCard({ order }: { order: Order }) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && order.stock_id) {
      JsBarcode(barcodeRef.current, order.stock_id, {
        format: 'CODE128',
        width: 2,
        height: 70,
        displayValue: true,
        fontSize: 14,
        margin: 10,
        background: '#ffffff',
        lineColor: '#000000'
      });
    }
  }, [order.stock_id]);

  return (
    <div className="order-card">
      {/* Barcode */}
      <div className="barcode-section">
        <svg ref={barcodeRef}></svg>
      </div>

      {/* Platform Badge */}
      <div className="platform-badge">
        🛍️ {order.platform === 'ebay' ? 'eBay' : 'Etsy'}
      </div>

      <hr />

      {/* Customer Details */}
      <div className="customer-details">
        <p>{order.customer_name}</p>
        <p>{order.customer_email}</p>
        <p>{order.customer_phone}</p>
        <p>{formatAddress(order.shipping_address)}</p>
      </div>

      {/* Actions */}
      <div className="actions">
        <button onClick={() => markShipped(order.id)}>
          Mark Shipped
        </button>
        <button onClick={() => printLabel(order)}>
          Print Label
        </button>
      </div>
    </div>
  );
}
```

---

## 11. ENVIRONMENT VARIABLES

```env
# Existing Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# eBay API
EBAY_CLIENT_ID=
EBAY_CLIENT_SECRET=
EBAY_WEBHOOK_VERIFICATION_TOKEN=

# Etsy API
ETSY_API_KEY=
ETSY_API_SECRET=

# Encryption (for storing tokens)
ENCRYPTION_SECRET=
```

---

## 12. DEVELOPMENT PHASES

### Phase 1 — Stock + Barcode (Week 1)
- [ ] Stock entry form (Investor + Company)
- [ ] Auto ID generation (INV/CS + INVP/CP)
- [ ] Barcode generation (JsBarcode CODE128)
- [ ] Clean print label (barcode + Stock ID only)
- [ ] Save stock to Supabase

### Phase 2 — Orders Section UI (Week 2)
- [ ] Orders page + navigation tab
- [ ] OrderCard component:
      - Barcode (top)
      - Platform badge (eBay/Etsy)
      - Customer details (bottom)
- [ ] Order stats bar
- [ ] Filter by platform + status
- [ ] Mark as shipped

### Phase 3 — eBay Webhook (Week 3)
- [ ] eBay developer account setup guide
- [ ] Webhook receiver (/api/webhooks/ebay)
- [ ] Signature verification
- [ ] Parse order → save to Supabase
- [ ] Settings page → paste eBay credentials
- [ ] Test with eBay sandbox

### Phase 4 — Etsy Webhook (Week 4)
- [ ] Etsy developer account setup guide
- [ ] Webhook receiver (/api/webhooks/etsy)
- [ ] Parse order → save to Supabase
- [ ] Settings page → paste Etsy credentials
- [ ] Test with Etsy sandbox

### Phase 5 — Polish (Week 5)
- [ ] Supabase Realtime — live order notification
- [ ] Print shipping label from order
- [ ] Mobile responsive
- [ ] Error handling

---

## 13. OPENCODE IMPLEMENTATION NOTES

- **KEY TRICK:** User manually lists on eBay/Etsy — but MUST put Stock ID (INV-001) in SKU field. Webhook returns this SKU so app knows which gem was sold.
- JsBarcode: use `<svg>` element not `<canvas>` — better print quality
- Supabase Realtime: subscribe to orders table — show toast notification when new order arrives
- eBay sandbox: test webhooks at developer.ebay.com before going live
- Etsy sandbox: test at developers.etsy.com
- Webhook signature verification is CRITICAL — never skip
- Token encryption: store eBay/Etsy tokens encrypted — never plain text
- Order card barcode: fetch stock_id from order → render barcode in useEffect
- Platform badge colors: eBay = orange (#E53238), Etsy = teal (#F1641E)
- No listing API needed — user handles that manually on eBay/Etsy
