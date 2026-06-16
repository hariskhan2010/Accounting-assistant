import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, transcript, context, audio, audioMimeType } = body;

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    const model = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";

    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const parts = [];

    if (audio && audioMimeType) {
      parts.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audio
        }
      });
    }

    const systemPrompt = prompt ||
      `You are a financial assistant for a gems and minerals business.
Answer only in Urdu. Keep answers brief and natural.
Today's date: ${new Date().toISOString().split("T")[0]}.
${context ? `Business context:\n${context}` : ""}
User message: ${transcript || "(audio message)"}`;

    parts.push({ text: systemPrompt });

    if (!parts.length) throw new Error("No input provided.");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 180
          }
        })
      }
    );
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || "Gemini request failed.");
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map((part: any) => part.text).join("") || "";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
