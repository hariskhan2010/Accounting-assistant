import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ebay-signature"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-ebay-signature");
    const verificationToken = Deno.env.get("EBAY_WEBHOOK_VERIFICATION_TOKEN");

    if (verificationToken && !signature) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const payload = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const lineItem = payload.lineItems?.[0];
    const shippingInfo = payload.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo;

    const orderData = {
      platform: "ebay",
      platform_order_id: payload.orderId || String(payload.orderId || ""),
      stock_id: lineItem?.sku || null,
      customer_name: shippingInfo?.fullName || payload.buyer?.username || null,
      customer_email: payload.buyer?.email || null,
      customer_phone: payload.buyer?.phoneNumber || null,
      shipping_address: shippingInfo?.contactAddress || null,
      order_amount: lineItem?.lineItemCost?.value ? parseFloat(lineItem.lineItemCost.value) : null,
      currency: lineItem?.lineItemCost?.currency || "USD",
      order_date: new Date().toISOString(),
      status: "pending",
      raw_payload: payload
    };

    const { error } = await supabase.from("orders").insert(orderData);

    if (error) throw error;

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
