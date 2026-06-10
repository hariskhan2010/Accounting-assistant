import { isSupabaseConfigured, requireSupabase } from "@/services/supabase";

export const GEMINI_LIVE_INPUT_SAMPLE_RATE = 16000;
export const GEMINI_LIVE_OUTPUT_SAMPLE_RATE = 24000;
export const GEMINI_LIVE_DEFAULT_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

const GEMINI_LIVE_WS_BASE =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";

export async function getGeminiLiveToken() {
  if (!isSupabaseConfigured) {
    return {
      token: "",
      model: GEMINI_LIVE_DEFAULT_MODEL,
      error: new Error("Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.")
    };
  }

  try {
    const { data, error } = await requireSupabase().functions.invoke("gemini-live-token");

    if (error) {
      const message = await getFunctionErrorMessage(error);
      return { token: "", model: GEMINI_LIVE_DEFAULT_MODEL, error: new Error(message) };
    }

    return {
      token: data?.token || "",
      model: data?.model || GEMINI_LIVE_DEFAULT_MODEL,
      error: data?.token ? null : new Error("Gemini Live token response did not include a token.")
    };
  } catch (error) {
    return { token: "", model: GEMINI_LIVE_DEFAULT_MODEL, error };
  }
}

async function getFunctionErrorMessage(error) {
  if (!error?.context) {
    return error?.message || "Gemini Live token function failed.";
  }

  try {
    const payload = await error.context.json();
    return payload?.error || payload?.message || error.message || "Gemini Live token function failed.";
  } catch {
    return error.message || "Gemini Live token function failed.";
  }
}

export function buildGeminiLiveUrl(token) {
  return `${GEMINI_LIVE_WS_BASE}?access_token=${encodeURIComponent(token)}`;
}

export function buildGeminiLiveSetup(model, context) {
  const systemInstruction = [
    "You are a live financial voice assistant for a gems and minerals trading business.",
    "The user may speak English, Urdu, or Roman Urdu.",
    "Always reply in the same language style the user used for their latest question: English for English, Urdu script for Urdu, Roman Urdu for Roman Urdu.",
    "Keep the conversation continuous, natural, brief, and focused on the user's accounting question.",
    "Use only the business data below. If requested data is missing, say clearly in the user's language that the data is not available.",
    `Current date: ${context.currentDate}`,
    `Entity: ${context.entityName}`,
    `This month revenue: ${context.monthRevenue}`,
    `This month purchases: ${context.monthPurchases}`,
    `This month expenses: ${context.monthExpenses}`,
    `This month salaries: ${context.monthSalaries}`,
    `This month mineral specimen profit: ${context.monthMineralProfit}`,
    `This month net profit: ${context.monthNetProfit}`,
    `Closing balance: ${context.closingBalance}`,
    `Current stock quantity: ${context.totalStockQuantity}`
  ].join("\n");

  return {
    setup: {
      model: `models/${model}`,
      generationConfig: {
        responseModalities: ["AUDIO"],
        temperature: 0.7
      },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    }
  };
}
