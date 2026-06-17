import { answerLocallyInUrdu, buildGeminiPrompt } from "@/modules/voice/businessContext";

const ZEN_API_URL = "https://opencode.ai/zen/v1/chat/completions";
const ZEN_MODEL = "big-pickle";
const zenApiKey = process.env.EXPO_PUBLIC_OPENCODE_ZEN_KEY;

async function callBigPickle(prompt) {
  const response = await fetch(ZEN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${zenApiKey}`
    },
    body: JSON.stringify({
      model: ZEN_MODEL,
      messages: [
        { role: "system", content: "You are a helpful assistant. Always respond in Roman Urdu (English alphabet, not Arabic script). Keep answers brief and natural." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 300
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Big Pickle request failed");
  return data?.choices?.[0]?.message?.content || "";
}

export async function askGeminiInUrdu({ transcript, context }) {
  if (!transcript) {
    return { answer: "", source: "none", error: new Error("Transcript is required.") };
  }

  const prompt = buildGeminiPrompt(transcript, context);

  if (zenApiKey && zenApiKey !== "YOUR_API_KEY_HERE") {
    try {
      const answer = await callBigPickle(prompt);
      if (answer) return { answer, source: "big-pickle", error: null };
    } catch {}
  }

  return {
    answer: answerLocallyInUrdu(transcript, context),
    source: "local",
    error: null
  };
}
