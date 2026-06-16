import { isSupabaseConfigured, requireSupabase } from "@/services/supabase";
import { answerLocallyInUrdu, buildGeminiPrompt } from "@/modules/voice/businessContext";

const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function callGeminiDirectly(prompt, audioData) {
  const model = process.env.EXPO_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
  const parts = [];

  if (audioData?.base64 && audioData?.mimeType) {
    parts.push({ inlineData: { mimeType: audioData.mimeType, data: audioData.base64 } });
  }
  parts.push({ text: prompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 180 }
      })
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Gemini request failed");
  const answer = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return answer;
}

export async function askGeminiInUrdu({ transcript, context }) {
  if (!transcript) {
    return { answer: "", source: "none", error: new Error("Transcript is required.") };
  }

  const prompt = buildGeminiPrompt(transcript, context);

  if (geminiApiKey) {
    try {
      const answer = await callGeminiDirectly(prompt);
      if (answer) return { answer, source: "gemini-direct", error: null };
    } catch {}
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await requireSupabase().functions.invoke("urdu-gemini-assistant", {
        body: { transcript, context, prompt }
      });
      if (!error && data?.answer) {
        return { answer: data.answer, source: "gemini-edge", error: null };
      }
    } catch {}
  }

  return {
    answer: answerLocallyInUrdu(transcript, context),
    source: "local",
    error: null
  };
}

export async function askGeminiWithAudio({ audioBase64, mimeType, context }) {
  if (!audioBase64) {
    return { answer: "", source: "none", error: new Error("Audio data is required.") };
  }

  const prompt = buildGeminiPrompt("(audio message)", context);

  if (geminiApiKey) {
    try {
      const answer = await callGeminiDirectly(prompt, { base64: audioBase64, mimeType: mimeType || "audio/webm" });
      if (answer) return { answer, source: "gemini-direct", error: null };
    } catch {}
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await requireSupabase().functions.invoke("urdu-gemini-assistant", {
        body: { audio: audioBase64, audioMimeType: mimeType || "audio/webm", context, transcript: "(audio message)" }
      });
      if (!error && data?.answer) {
        return { answer: data.answer, source: "gemini-edge", error: null };
      }
    } catch {}
  }

  return { answer: "معاف کیجیے، آڈیو پروسیسنگ میں مسئلہ ہوا۔", source: "local", error: null };
}
