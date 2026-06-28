import { requireSupabase, isSupabaseConfigured } from "@/services/supabase";
import { createStockItem as createLocal, listStockItems as listLocal, updateStockItemStatus as updateLocal, getStockItemByStockId as getLocal, deleteStockItem as deleteLocal } from "./localOrdersStore";

export async function createStockItem(payload) {
  if (!isSupabaseConfigured) return { data: await createLocal(payload), error: null };
  try {
    const { data, error } = await requireSupabase().from("stock_items").insert({
      stock_type: payload.stockType,
      stock_id: payload.stockId,
      payment_id: payload.paymentId,
      investor_name: payload.investorName || null,
      company_name: payload.companyName || null,
      gem_type: payload.gemType,
      weight: payload.weight,
      gem_length: payload.gemLength || null,
      gem_width: payload.gemWidth || null,
      buy_price: payload.buyPrice || null,
      shipping_price: payload.shippingPrice || null,
      sell_price: payload.sellPrice || null,
      entry_date: payload.entryDate || new Date().toISOString().slice(0, 10),
      status: "available"
    }).select().single();
    return { data, error };
  } catch (e) {
    return { data: await createLocal(payload), error: null };
  }
}

function snakeToCamel(row) {
  return {
    id: row.id,
    stockId: row.stock_id,
    paymentId: row.payment_id,
    stockType: row.stock_type,
    investorName: row.investor_name,
    companyName: row.company_name,
    gemType: row.gem_type,
    weight: row.weight,
    gemLength: row.gem_length,
    gemWidth: row.gem_width,
    buyPrice: row.buy_price,
    shippingPrice: row.shipping_price,
    sellPrice: row.sell_price,
    entryDate: row.entry_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listStockItems({ stockType, status } = {}) {
  if (!isSupabaseConfigured) return { data: await listLocal({ stockType, status }), error: null };
  try {
    let query = requireSupabase().from("stock_items").select("*").order("entry_date", { ascending: false });
    if (stockType) query = query.eq("stock_type", stockType);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return { data: (data || []).map(snakeToCamel), error: null };
  } catch (e) {
    return { data: await listLocal({ stockType, status }), error: null };
  }
}

export async function updateStockItemStatus(id, status) {
  if (!isSupabaseConfigured) return { data: await updateLocal(id, status), error: null };
  try {
    const { data, error } = await requireSupabase().from("stock_items").update({ status }).eq("id", id).select().single();
    return { data, error };
  } catch (e) {
    return { data: await updateLocal(id, status), error: null };
  }
}

export async function deleteStockItem(id) {
  if (!isSupabaseConfigured) return { data: await deleteLocal(id), error: null };
  try {
    const { error } = await requireSupabase().from("stock_items").delete().eq("id", id);
    if (error) throw error;
    return { data: true, error: null };
  } catch (e) {
    return { data: await deleteLocal(id), error: null };
  }
}

export async function getStockItemByStockId(stockId) {
  if (!isSupabaseConfigured) return { data: await getLocal(stockId), error: null };
  try {
    const { data, error } = await requireSupabase().from("stock_items").select("*").eq("stock_id", stockId).single();
    if (error) throw error;
    return { data: data ? snakeToCamel(data) : null, error: null };
  } catch (e) {
    return { data: await getLocal(stockId), error: null };
  }
}
