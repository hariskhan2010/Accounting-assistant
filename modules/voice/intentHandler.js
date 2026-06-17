const INTENTS = {
  ADD_PURCHASE: "add_purchase",
  ADD_SALE: "add_sale",
  ADD_EXPENSE: "add_expense",
  ADD_MINERAL: "add_mineral",
  ADD_STAFF: "add_staff",
  PAY_SALARY: "pay_salary",
  CHECK_STOCK: "check_stock",
  CHECK_REVENUE: "check_revenue",
  CHECK_PROFIT: "check_profit",
  CHECK_BALANCE: "check_balance",
  CHECK_EXPENSES: "check_expenses"
};

const patterns = {
  purchase: [
    /(?:add|record|new|create|enter|daal|rakh)\s*(?:a\s*)?purchase/i,
    /kharid[di]?[ai]?/i,
    /خرید/i,
    /kharidar/i,
    /buy/i,
    /khar[iy]d/i,
    /purchase\s*(?:add|karo|daal|rakh|kro)/i,
    /(?:add|daal|rakh|karo|kro)\s*(?:kharid|kharida|purchase)/i,
    /kharid[ae]ri/i,
    /mol\s*(?:kharid|le)/i,
    /khareed[iy]/i
  ],
  sale: [
    /(?:add|record|new|create|enter|daal|rakh)\s*(?:a\s*)?sale/i,
    /bech[ai]?/i,
    /فروخت/i,
    /farokht/i,
    /sell/i,
    /b[ei]ch/i,
    /sale\s*(?:add|karo|daal|rakh|kro)/i,
    /(?:add|daal|rakh|karo|kro)\s*(?:sale|bech|farokht)/i,
    /bik[rz]i/i,
    /bik[rz]y/i,
    /bech[ea]y/i
  ],
  expense: [
    /(?:add|record|new|create|enter|daal|rakh)\s*(?:an?\s*)?expense/i,
    /kharch[ae]?/i,
    /خرچ/i,
    /expense/i,
    /\b(bill|bijli|paani|gas|rent)\b/i,
    /(?:bill|bijli|paani|gas|rent|utility)\s*(?:add|karo|daal|rakh)/i,
    /(?:add|daal|rakh|karo|kro)\s*(?:bill|bijli|paani|gas|rent|expense|kharch)/i,
    /kharcha/i,
    /srf[ra]/i
  ],
  mineral: [
    /(?:add|record|new|create|enter|daal|rakh)\s*(?:a\s*)?mineral/i,
    /specimen/i,
    /mineral/i,
    /namuna/i,
    /pathar/i,
    /gem/i,
    /mineral\s*(?:add|karo|daal|rakh)/i,
    /(?:add|daal|rakh|karo)\s*(?:mineral|namuna|pathar)/i
  ],
  staff: [
    /(?:add|record|new|create|enter|daal|rakh)\s*(?:a\s*)?staff/i,
    /mulazim/i,
    /employee/i,
    /worker/i,
    /staff/i,
    /staff\s*(?:add|karo|daal|rakh)/i,
    /(?:add|daal|rakh|karo|kro)\s*(?:staff|mulazim|employee|worker|karmchari|aadmi)/i,
    /karm[cz]h[ae]ri/i,
    /mulazmeen/i
  ],
  salary: [
    /(?:pay|give|send|do|karo)\s*(?:salary|tan[ck]hwa)/i,
    /تنخواہ/i,
    /salary\s*(?:pay|de|do|karo)/i,
    /tan[ck]hw[ah][hi]?/i,
    /salary\s*(?:add|karo|daal|rakh)/i,
    /(?:add|daal|rakh|karo|pay|de|do)\s*(?:salary|tankhwa)/i,
    /tan[ck]hwa[hi]?\s*(?:add|karo|daal|pay)/i
  ],
  stock: [
    /(?:check|show|tell|see|kitna|kya)\s*(?:stock|stock|اسٹاک)/i,
    /stock\s*(?:check|balance|kitna|bata)/i,
    /کتنا\s*(?:سٹاک|اسٹاک|stock)/i,
    /b[aa]qi\s*(?:stock|maal|samaan)/i,
    /stock\s*(?:kya|kitna|batao|dikhao)/i,
    /کتنا\s*(?:مال|سامان)/i,
    /inventory/i,
    /(?:kitna|kya|check|bata)\s*(?:maal|samaan|stock)/i
  ],
  revenue: [
    /(?:check|show|tell|kitna|kya)\s*(?:revenue|income|aamdani|آمدنی)/i,
    /آمدنی/i,
    /aamdani/i,
    /sales?\s*(?:kitna|kya)/i,
    /revenue/i,
    /kam[ae]i/i,
    /income/i,
    /aamd[ae]ni/i,
    /kitni\s*(?:aamdani|income|revenue|kamai)/i
  ],
  profit: [
    /(?:check|show|tell|kitna|kya)\s*(?:profit|munafa|nafa|منافع)/i,
    /منافع/i,
    /munaf[ae]/i,
    /profit/i,
    /naf[ae]/i,
    /f[ae]ida/i,
    /kitna\s*(?:munafa|nafa|profit)/i
  ],
  balance: [
    /(?:check|show|tell|kitna|kya)\s*(?:balance|closing|بیلنس)/i,
    /بیلنس/i,
    /balance/i,
    /closing/i,
    /b[ae]l[ae]ns/i,
    /kitna\s*(?:balance|closing|baki)/i,
    /b[aa]ki\s*(?:kitna|kya)/i
  ],
  expenses_query: [
    /(?:check|show|tell|kitna|kya)\s*(?:expense|expenses|kharch|خرچ)/i,
    /kitne\s*(?:kharch|expense)/i,
    /kharch[ae]?\s*(?:kitne|kitna|kya)/i,
    /(?:total|kul)\s*(?:expense|kharch)/i
  ]
};

function extractAmount(text) {
  const numMatch = text.match(/(?:rs\.?\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i);
  if (numMatch) return Number(numMatch[1].replace(/,/g, ""));

  const wordMap = {
    "ek": 1, "do": 2, "teen": 3, "chaar": 4, "paanch": 5,
    "chay": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
    "gyaarah": 11, "baarah": 12, "tera": 13, "chauda": 14,
    "pandra": 15, "solah": 16, "satra": 17, "athaara": 18,
    "unnees": 19, "bees": 20, "pachchis": 25, "tris": 30,
    "pachas": 50, "sau": 100, "hazaar": 1000, "lakh": 100000,
    "crore": 10000000
  };

  let total = 0;
  const words = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    if (wordMap[words[i]] !== undefined) {
      if (words[i + 1] === "hazaar" || words[i + 1] === "sau" || words[i + 1] === "lakh" || words[i + 1] === "crore") {
        total += wordMap[words[i]] * (wordMap[words[i + 1]] || 1);
        i++;
      } else {
        total += wordMap[words[i]];
      }
    }
    if (words[i] === "hazaar") total += total === 0 ? 1000 : 0;
    if (words[i] === "lakh") total *= 100;
    if (words[i] === "crore") total *= 100;
  }

  return total || null;
}

function extractCompany(text) {
  const textLower = text.toLowerCase();
  if (/(?:company|company\s*a|company_a|first\s*company|business|compani)/i.test(textLower)) return "company-a";
  if (/\b(self|apna|personal|my|khud|apnay|mere|meri)\b/i.test(textLower)) return "self";
  if (/\bself\s*(?:mein|mai|main)\b/i.test(textLower)) return "self";
  if (/\bcompany\s*(?:mein|mai|main)\b/i.test(textLower)) return "company-a";
  return null;
}

function extractItem(text) {
  const itemMatch = text.match(/(?:item|cheez|maal|product|good)\s+(?:is|was|called|named|)\s*["']?([^"'\d,]+?)["']?(?:\s+(?:for|of|worth|rs|quantity))/i);
  if (itemMatch) return itemMatch[1].trim();

  const itemMatch2 = text.match(/(?:for|of|item|cheez|maal)\s+["']?([A-Za-z\u0600-\u06FF\s]{2,30})["']?(?:\s+(?:for|of|worth|rs|quantity|price))/i);
  if (itemMatch2) return itemMatch2[1].trim();

  const fallback = text.match(/(?:purchase|bought|sold|buy|sell)\s+(?:a\s+|an\s+|the\s+)?["']?([A-Za-z\u0600-\u06FF\s]{2,30})["']?/i);
  if (fallback) return fallback[1].trim();

  const kaMatch = text.match(/([\u0600-\u06FF\w]{2,30})\s+ka\s+(?:bill|purchase|sale|add|karo|daal)/i);
  if (kaMatch) return kaMatch[1].trim();

  const billMatch = text.match(/([\u0600-\u06FF\w]{2,30})\s+(?:ka|ki)\s+bill/i);
  if (billMatch) return billMatch[1].trim() + " bill";

  return null;
}

function extractExpenseType(text) {
  const textLower = text.toLowerCase();
  if (/\bcut(?:ting)?\b|\bkata[ei]\b/i.test(textLower)) return "cutting";
  if (/\bpolish(?:ing)?\b/.test(textLower)) return "polishing";
  if (/\blab\b|\btest(?:ing)?\b|\bcertificate\b/.test(textLower)) return "lab_testing";
  if (/\bshipping\b|\bfreight\b|\b(out|in)going\b|\bbhej[ai]/.test(textLower)) {
    if (/\bin(?:coming|ward)?\s*(?:shipping|freight)/.test(textLower)) return "shipping_in";
    return "shipping_out";
  }
  if (/\brent\b|\bkera[yi]\b|\bkir[ae]y[ae]\b/.test(textLower)) return "rent";
  if (/\butility|\bbijli\b|\bpaani\b|\bgas\b|\bbill\b|\blight\b|\bbijli ka bill/i.test(textLower)) return "utility";
  if (/\bdaily\b|\bmisc\b|\bother\b|\bgeneral\b|\brozana\b/.test(textLower)) return "daily";
  return null;
}

function extractCategory(text) {
  const textLower = text.toLowerCase();
  if (/\braw\b|\bkacha\b|\buncut\b/.test(textLower)) return "raw";
  if (/\bpolish(?:ed)?\b|\bcut\b/.test(textLower)) return "polished";
  if (/\bspecimen\b|\bmineral\b/.test(textLower)) return "specimen";
  return "raw";
}

function extractQuantity(text) {
  const qtyMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:pcs|kg|g|ct|lot|pieces|kilograms|grams|carat|crates?)/i);
  if (qtyMatch) return Number(qtyMatch[1]);
  return 1;
}

function extractUnit(text) {
  const textLower = text.toLowerCase();
  if (/\bct\b|\bcarat\b/.test(textLower)) return "ct";
  if (/\bkg\b|\bkilogram\b/.test(textLower)) return "kg";
  if (/\bg\b|\bgram\b/.test(textLower)) return "g";
  if (/\b(pcs|pieces?|numb|unit)\b/.test(textLower)) return "pcs";
  if (/\blot\b|\bcrate\b/.test(textLower)) return "lot";
  return "pcs";
}

function extractDate(text) {
  const textLower = text.toLowerCase();
  if (/\btoday\b|\baaj\b|\baajj\b/.test(textLower)) return new Date().toISOString().slice(0, 10);
  if (/\byesterday\b|\bkal\b/.test(textLower)) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  const dateMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  return new Date().toISOString().slice(0, 10);
}

function extractBuyer(text) {
  const buyerMatch = text.match(/(?:to|buyer|customer|client|for)\s+["']?([A-Za-z\u0600-\u06FF\s]{2,30})["']?/i);
  if (buyerMatch) return buyerMatch[1].trim();
  return "Cash Sale";
}

function extractDesignation(text) {
  const desigMatch = text.match(/(?:as|designation|role|position|kaam)\s+["']?([A-Za-z\u0600-\u06FF\s]{2,20})["']?/i);
  if (desigMatch) return desigMatch[1].trim();
  return "Worker";
}

function extractStaffName(text) {
  const nameMatch = text.match(/(?:name|naam|for|hire|add)\s+["']?([A-Za-z\u0600-\u06FF\s]{2,30})["']?(?:\s+(?:as|designation|role))/i);
  if (nameMatch) return nameMatch[1].trim();
  const fallback = text.match(/(?:staff|employee|worker|mulazim|aadmi)\s+["']?([A-Za-z\u0600-\u06FF\s]{2,30})["']?/i);
  if (fallback) return fallback[1].trim();
  return null;
}

function extractMonth(text) {
  const textLower = text.toLowerCase();
  const months = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };
  for (const [name, num] of Object.entries(months)) {
    if (textLower.includes(name)) return num;
  }
  const numMatch = text.match(/month\s*(\d{1,2})/i);
  if (numMatch) return Number(numMatch[1]);
  return new Date().getMonth() + 1;
}

function detectIntent(text) {
  for (const [intent, regexps] of Object.entries(patterns)) {
    if (regexps.some((re) => re.test(text))) return intent;
  }
  return null;
}

export function parseCommand(text) {
  const rawIntent = detectIntent(text);
  if (!rawIntent) return { type: "query", raw: text };

  const isAction = ["purchase", "sale", "expense", "mineral", "staff", "salary"].includes(rawIntent);
  const type = isAction ? "action" : "query";

  const params = {
    companyId: extractCompany(text),
    date: extractDate(text),
    amount: extractAmount(text),
    item: extractItem(text),
    category: extractCategory(text),
    quantity: extractQuantity(text),
    unit: extractUnit(text),
    raw: text
  };

  if (rawIntent === "purchase") {
    params.description = params.item || text.replace(/add|record|enter|daal|rakh|karo|purchase|kharid|خرید|buy/i, "").trim();
    return { type: "action", intent: "add_purchase", params };
  }
  if (rawIntent === "sale") {
    params.buyer = extractBuyer(text);
    params.description = params.item || text.replace(/add|record|enter|daal|rakh|karo|sale|bech|فروخت|sell/i, "").trim();
    return { type: "action", intent: "add_sale", params };
  }
  if (rawIntent === "expense") {
    params.expenseType = extractExpenseType(text);
    params.description = params.item || text.replace(/add|record|enter|daal|rakh|karo|expense|kharcha|خرچ/i, "").trim();
    return { type: "action", intent: "add_expense", params };
  }
  if (rawIntent === "mineral") {
    return { type: "action", intent: "add_mineral", params };
  }
  if (rawIntent === "staff") {
    params.staffName = extractStaffName(text);
    params.designation = extractDesignation(text);
    return { type: "action", intent: "add_staff", params };
  }
  if (rawIntent === "salary") {
    params.staffName = extractStaffName(text);
    params.month = extractMonth(text);
    params.year = new Date().getFullYear();
    return { type: "action", intent: "pay_salary", params };
  }

  if (rawIntent === "stock") return { type: "query", intent: "check_stock", params };
  if (rawIntent === "revenue") return { type: "query", intent: "check_revenue", params };
  if (rawIntent === "profit") return { type: "query", intent: "check_profit", params };
  if (rawIntent === "balance") return { type: "query", intent: "check_balance", params };
  if (rawIntent === "expenses_query") return { type: "query", intent: "check_expenses", params };

  return { type: "query", raw: text };
}

export { INTENTS, extractCompany };
