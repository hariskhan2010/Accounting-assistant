import { isSupabaseConfigured, requireSupabase } from "@/services/supabase";
import { answerLocallyInUrdu, buildGeminiPrompt } from "@/modules/voice/businessContext";

export async function askGeminiInUrdu({ transcript, context }) {
  if (!transcript) {
    return { answer: "", source: "none", error: new Error("Transcript is required.") };
  }

  if (!isSupabaseConfigured) {
    return {
      answer: answerLocallyInUrdu(transcript, context),
      source: "local",
      error: null
    };
  }

  try {
    const prompt = buildGeminiPrompt(transcript, context);
    const { data, error } = await requireSupabase().functions.invoke("urdu-gemini-assistant", {
      body: {
        transcript,
        context,
        prompt
      }
    });

    if (error) {
      return {
        answer: answerLocallyInUrdu(transcript, context),
        source: "local",
        error
      };
    }

    return {
      answer: data?.answer || answerLocallyInUrdu(transcript, context),
      source: data?.answer ? "gemini" : "local",
      error: null
    };
  } catch (error) {
    return {
      answer: answerLocallyInUrdu(transcript, context),
      source: "local",
      error
    };
  }
}
