import { createPlatformStorage } from "@/services/platformStorage";
import { generateStockId, generatePaymentId } from "@/modules/accounting/constants";

const STORAGE_KEY = "gems-accounting:v2";
const storage = createPlatformStorage();

const emptyState = {
  stockItems: [],
  orders: [],
  platformCredentials: []
};

let lastStockCount = { investor: 0, company: 0 };

function nextStockId(type) {
  lastStockCount[type] += 1;
  const prefix = type === "investor" ? "INV" : "CS";
  return `${prefix}-${String(lastStockCount[type]).padStart(3, "0")}`;
}

function nextPaymentId(type) {
  const prefix = type === "investor" ? "INVP" : "CP";
  return `${prefix}-${String(lastStockCount[type]).padStart(3, "0")}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function loadOrdersState() {
  try {
    const raw = await storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      lastStockCount.investor = parsed.stockItems.filter((s) => s.stockType === "investor").length;
      lastStockCount.company = parsed.stockItems.filter((s) => s.stockType === "company").length;
      return { ...emptyState, ...parsed };
    }
  } catch (e) {
  }
  return { ...emptyState };
}

async function saveOrdersState(state) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export async function createStockItem(payload) {
  const state = await loadOrdersState();
  const type = payload.stockType;
  const stockId = nextStockId(type);
  const paymentId = nextPaymentId(type);
  const entry = {
    id: `stock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    stockId,
    paymentId,
    stockType: type,
    investorName: payload.investorName || null,
    companyName: payload.companyName || null,
    gemType: payload.gemType,
    weight: payload.weight,
    gemLength: payload.gemLength || null,
    gemWidth: payload.gemWidth || null,
    buyPrice: payload.buyPrice || null,
    shippingPrice: payload.shippingPrice || null,
    sellPrice: payload.sellPrice || null,
    entryDate: payload.entryDate || today(),
    status: "available",
    createdAt: new Date().toISOString()
  };
  state.stockItems.unshift(entry);
  await saveOrdersState(state);
  return entry;
}

export async function listStockItems({ stockType, status } = {}) {
  const state = await loadOrdersState();
  let items = state.stockItems;
  if (stockType) items = items.filter((i) => i.stockType === stockType);
  if (status) items = items.filter((i) => i.status === status);
  return items;
}

export async function updateStockItemStatus(id, status) {
  const state = await loadOrdersState();
  const idx = state.stockItems.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  state.stockItems[idx].status = status;
  await saveOrdersState(state);
  return state.stockItems[idx];
}

export async function deleteStockItem(id) {
  const state = await loadOrdersState();
  state.stockItems = state.stockItems.filter((i) => i.id !== id);
  await saveOrdersState(state);
  return true;
}

export async function getStockItemByStockId(stockId) {
  const state = await loadOrdersState();
  return state.stockItems.find((i) => i.stockId === stockId) || null;
}

export async function createOrder(payload) {
  const state = await loadOrdersState();
  const entry = {
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    platform: payload.platform,
    platformOrderId: payload.platformOrderId,
    stockId: payload.stockId || null,
    customerName: payload.customerName || null,
    customerEmail: payload.customerEmail || null,
    customerPhone: payload.customerPhone || null,
    shippingAddress: payload.shippingAddress || null,
    orderAmount: payload.orderAmount || null,
    currency: payload.currency || "USD",
    orderDate: payload.orderDate || new Date().toISOString(),
    status: payload.status || "pending",
    trackingNumber: payload.trackingNumber || null,
    rawPayload: payload.rawPayload || null,
    createdAt: new Date().toISOString()
  };
  state.orders.unshift(entry);
  await saveOrdersState(state);
  return entry;
}

export async function listOrders({ platform, status } = {}) {
  const state = await loadOrdersState();
  let items = state.orders;
  if (platform) items = items.filter((o) => o.platform === platform);
  if (status) items = items.filter((o) => o.status === status);
  return items;
}

export async function updateOrderStatus(id, status, trackingNumber) {
  const state = await loadOrdersState();
  const idx = state.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  state.orders[idx].status = status;
  if (trackingNumber) state.orders[idx].trackingNumber = trackingNumber;
  await saveOrdersState(state);
  return state.orders[idx];
}

export async function deleteOrder(id) {
  const state = await loadOrdersState();
  state.orders = state.orders.filter((o) => o.id !== id);
  await saveOrdersState(state);
}

export async function getOrdersStats() {
  const state = await loadOrdersState();
  const orders = state.orders;
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    revenue: orders.reduce((sum, o) => sum + (Number(o.orderAmount) || 0), 0)
  };
}
