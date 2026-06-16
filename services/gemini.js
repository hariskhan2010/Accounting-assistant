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
      body: { transcript, context, prompt }
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

export async function askGeminiWithAudio({ audioBase64, mimeType, context }) {
  if (!audioBase64) {
    return { answer: "", source: "none", error: new Error("Audio data is required.") };
  }

  if (!isSupabaseConfigured) {
    return { answer: "معاف کیجیے، آڈیو صرف سرور پر پروسیس ہو سکتا ہے۔", source: "local", error: null };
  }

  try {
    const { data, error } = await requireSupabase().functions.invoke("urdu-gemini-assistant", {
      body: {
        audio: audioBase64,
        audioMimeType: mimeType || "audio/webm",
        context,
        transcript: "(audio message)"
      }
    });

    if (error) {
      return { answer: "معاف کیجیے، آڈیو پروسیسنگ میں مسئلہ ہوا۔", source: "local", error };
    }

    return {
      answer: data?.answer || "",
      source: data?.answer ? "gemini" : "local",
      error: null
    };
  } catch (error) {
    return {
      answer: "معاف کیجیے، آڈیو پروسیسنگ میں مسئلہ ہوا۔",
      source: "local",
      error
    };
  }
}
