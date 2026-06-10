import * as FileSystem from "expo-file-system";
import { isSupabaseConfigured, requireSupabase } from "@/services/supabase";

export async function synthesizeUrduSpeech(text) {
  if (!text) {
    return { uri: null, error: new Error("Text is required for speech synthesis.") };
  }

  if (!isSupabaseConfigured) {
    return {
      uri: null,
      error: new Error("Text-to-speech is not configured. Configure Supabase Edge Functions for ElevenLabs playback.")
    };
  }

  try {
    const { data, error } = await requireSupabase().functions.invoke("urdu-elevenlabs-tts", {
      body: { text }
    });

    if (error) return { uri: null, error };
    if (!data?.audioBase64) return { uri: null, error: new Error("No audio returned from TTS service.") };

    const uri = `${FileSystem.cacheDirectory}urdu-answer-${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(uri, data.audioBase64, {
      encoding: FileSystem.EncodingType.Base64
    });

    return { uri, error: null };
  } catch (error) {
    return { uri: null, error };
  }
}
