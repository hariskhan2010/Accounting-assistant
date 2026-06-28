import { requireSupabase, isSupabaseConfigured } from "@/services/supabase";
import {
  createOrder as createLocal,
  listOrders as listLocal,
  updateOrderStatus as updateLocal,
  deleteOrder as deleteLocal,
  getOrdersStats as statsLocal
} from "./localOrdersStore";

export async function createOrder(payload) {
  if (!isSupabaseConfigured) return { data: await createLocal(payload), error: null };
  try {
    const { data, error } = await requireSupabase().from("orders").insert({
      platform: payload.platform,
      platform_order_id: payload.platformOrderId,
      stock_id: payload.stockId || null,
      customer_name: payload.customerName || null,
      customer_email: payload.customerEmail || null,
      customer_phone: payload.customerPhone || null,
      shipping_address: payload.shippingAddress || null,
      order_amount: payload.orderAmount || null,
      currency: payload.currency || "USD",
      order_date: payload.orderDate || new Date().toISOString(),
      status: payload.status || "pending",
      tracking_number: payload.trackingNumber || null,
      raw_payload: payload.rawPayload || null
    }).select().single();
    return { data, error };
  } catch (e) {
    return { data: await createLocal(payload), error: null };
  }
}

export async function listOrders({ platform, status } = {}) {
  if (!isSupabaseConfigured) return { data: await listLocal({ platform, status }), error: null };
  try {
    let query = requireSupabase().from("orders").select("*").order("created_at", { ascending: false });
    if (platform) query = query.eq("platform", platform);
    if (status) query = query.eq("status", status);
    return query;
  } catch (e) {
    return { data: await listLocal({ platform, status }), error: null };
  }
}

export async function updateOrderStatus(id, status, trackingNumber) {
  const updateData = { status };
  if (trackingNumber) updateData.tracking_number = trackingNumber;
  if (!isSupabaseConfigured) return { data: await updateLocal(id, status, trackingNumber), error: null };
  try {
    const { data, error } = await requireSupabase().from("orders").update(updateData).eq("id", id).select().single();
    return { data, error };
  } catch (e) {
    return { data: await updateLocal(id, status, trackingNumber), error: null };
  }
}

export async function deleteOrder(id) {
  if (!isSupabaseConfigured) return deleteLocal(id);
  try {
    return await requireSupabase().from("orders").delete().eq("id", id);
  } catch (e) {
    return deleteLocal(id);
  }
}

export async function getOrdersStats() {
  if (!isSupabaseConfigured) return statsLocal();
  try {
    const { data: orders } = await requireSupabase().from("orders").select("*");
    return {
      total: orders?.length || 0,
      pending: orders?.filter((o) => o.status === "pending").length || 0,
      shipped: orders?.filter((o) => o.status === "shipped").length || 0,
      delivered: orders?.filter((o) => o.status === "delivered").length || 0,
      revenue: orders?.reduce((sum, o) => sum + (Number(o.order_amount) || 0), 0) || 0
    };
  } catch (e) {
    return statsLocal();
  }
}
