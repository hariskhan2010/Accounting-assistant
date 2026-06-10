/* eslint-disable import/no-unresolved */
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { GoogleGenAI } from "npm:@google/genai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    const model = Deno.env.get("GEMINI_LIVE_MODEL") || "gemini-2.5-flash-native-audio-preview-12-2025";

    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const client = new GoogleGenAI({
      apiKey,
      httpOptions: { apiVersion: "v1alpha" }
    });
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: ["AUDIO"]
          }
        },
        httpOptions: { apiVersion: "v1alpha" }
      }
    });

    return new Response(JSON.stringify({ token: token.name, model }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
