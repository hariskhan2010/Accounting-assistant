import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const transaction = payload.transactions?.[0];

    const orderData = {
      platform: "etsy",
      platform_order_id: String(payload.receipt_id || ""),
      stock_id: transaction?.sku || null,
      customer_name: payload.name || null,
      customer_email: payload.buyer_email || null,
      customer_phone: null,
      shipping_address: {
        addressLine1: payload.first_line || null,
        addressLine2: payload.second_line || null,
        city: payload.city || null,
        state: payload.state || null,
        postalCode: payload.zip || null,
        country: payload.country_iso || null
      },
      order_amount: payload.total_price ? payload.total_price / 100 : null,
      currency: "USD",
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
