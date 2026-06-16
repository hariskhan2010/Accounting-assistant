import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as Audio from "expo-av";
import { FadeInView } from "@/components/animated/FadeInView";
import { StaggerList } from "@/components/animated/StaggerList";
import { Ionicons } from "@expo/vector-icons";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChatBubble } from "@/components/voice/ChatBubble";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { buildVoiceBusinessContext } from "@/modules/voice/businessContext";
import { askGeminiInUrdu, askGeminiWithAudio } from "@/services/gemini";
import { isSupabaseConfigured, requireSupabase } from "@/services/supabase";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { colors } from "@/theme";

function speakWithBrowser(text) {
  try {
    if (!window?.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ur-PK";
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const urduVoice = voices.find((v) => v.lang.startsWith("ur"));
    if (urduVoice) utterance.voice = urduVoice;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

async function speakText(text) {
  if (!text) return;

  if (isSupabaseConfigured) {
    try {
      const { data } = await requireSupabase().functions.invoke("urdu-elevenlabs-tts", {
        body: { text }
      });
      if (data?.audioBase64) {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:${data.mimeType || "audio/mpeg"};base64,${data.audioBase64}` },
          { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.didJustFinish) sound.unloadAsync();
        });
        return;
      }
    } catch {}
  }

  speakWithBrowser(text);
}

const WELCOME_TEXT = "Assalamalaikom! Mai aapka financial assistant hoon. Aap kya poochna chahenge?";

export default function VoiceScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [textInput, setTextInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [micError, setMicError] = useState("");
  const inputRef = useRef(null);
  const initialized = useRef(false);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const { messages, appendMessage } = useVoiceChat(companyFilter);

  function getSupportedMimeType() {
    if (typeof MediaRecorder === "undefined") return "";
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
      "audio/mp4"
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  }

  const processAudioBlob = useCallback(async (blob, mimeType) => {
    if (blob.size < 200) return;

    setThinking(true);

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      appendMessage("user", "🎤 (voice message)", { source: "voice" });

      try {
        const context = await buildVoiceBusinessContext(companyFilter);
        const { answer } = await askGeminiWithAudio({
          audioBase64: base64,
          mimeType,
          context
        });
        if (answer) {
          appendMessage("assistant", answer, { source: "gemini-api" });
          speakText(answer);
        }
      } catch {
        appendMessage("assistant", "معاف کیجیے، میں اس وقت آپ کی مدد نہیں کر سکتا۔ براہ کرم دوبارہ کوشش کریں۔", { source: "error" });
      } finally {
        setThinking(false);
      }
    };
  }, [companyFilter, appendMessage]);

  async function startRecording() {
    setMicError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = getSupportedMimeType() || "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        setRecording(false);
        processAudioBlob(blob, recorder.mimeType);
      };

      recorder.onerror = () => {
        stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current = null;
        mediaStreamRef.current = null;
        setRecording(false);
        setMicError("Recording failed. Try again.");
      };

      setRecording(true);
      recorder.start();
    } catch (err) {
      setMicError(err.name === "NotAllowedError"
        ? "Microphone access denied. Allow mic in browser settings."
        : "Microphone not available. Use text input instead.");
      setRecording(false);
    }
  }

  const handlePressIn = useCallback(() => {
    if (mediaRecorderRef.current) return;
    startRecording();
  }, []);

  const handlePressOut = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    appendMessage({ id: "welcome", role: "assistant", text: WELCOME_TEXT, source: "local" });
    speakText(WELCOME_TEXT);

    buildVoiceBusinessContext(companyFilter)
      .then((context) => askGeminiInUrdu({ transcript: "greeting", context }))
      .then(({ answer }) => {
        if (answer) speakText(answer);
      })
      .catch(() => {});
  }, [companyFilter, appendMessage]);

  const handleSendText = useCallback(async () => {
    const text = textInput.trim();
    if (!text || thinking) return;

    setTextInput("");
    appendMessage("user", text, { source: "text" });
    setThinking(true);

    try {
      const context = await buildVoiceBusinessContext(companyFilter);
      const { answer } = await askGeminiInUrdu({ transcript: text, context });
      if (answer) {
        appendMessage("assistant", answer, { source: "gemini-api" });
        speakText(answer);
      }
    } catch {
      appendMessage("assistant", "معاف کیجیے، میں اس وقت آپ کی مدد نہیں کر سکتا۔ براہ کرم دوبارہ کوشش کریں۔", { source: "error" });
    } finally {
      setThinking(false);
    }
  }, [textInput, thinking, companyFilter, appendMessage]);

  return (
    <View style={styles.screen}>
      <View style={styles.headerArea}>
        <LuxuryScreenHeader colorIndex={8} title="Live Voice Assistant" subtitle="Speak in English, Urdu, or Roman Urdu" />
        <FadeInView delay={80}>
          <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
        </FadeInView>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <FadeInView>
            <View style={styles.empty}>
              <View style={styles.gemIcon}>
                <Text style={styles.gemChar}>💎</Text>
              </View>
              <Text style={styles.emptyTitle}>Financial Assistant</Text>
              <Text style={styles.emptyHint}>Ask any question about your business.</Text>
            </View>
          </FadeInView>
        ) : (
          <StaggerList
            baseDelay={60}
            direction="left"
            items={messages}
            renderItem={(message) => <ChatBubble key={message.id} role={message.role} text={message.text} />}
          />
        )}
        {thinking ? (
          <View style={styles.thinkingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.thinkingText}>Thinking...</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomBar}>
        {micError ? <Text style={styles.micError}>{micError}</Text> : null}
        <View style={styles.inputRow}>
          <VoiceButton
            active={recording}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder={recording ? "Listening..." : "Type in Urdu / English..."}
            placeholderTextColor={colors.textMuted}
            value={textInput}
            onChangeText={setTextInput}
            onSubmitEditing={handleSendText}
            returnKeyType="send"
            editable={!thinking && !recording}
          />
          <Pressable onPress={handleSendText} disabled={thinking || recording} style={[styles.sendBtn, (thinking || recording) && styles.sendBtnDisabled]}>
            <Ionicons name="send" size={20} color={colors.background} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 8
  },
  empty: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center"
  },
  emptyTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  gemChar: {
    fontSize: 48
  },
  gemIcon: {
    alignItems: "center",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 50,
    height: 80,
    justifyContent: "center",
    width: 80
  },
  headerArea: {
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    width: "100%"
  },
  messages: {
    flexGrow: 1,
    gap: 12,
    padding: 16
  },
  micError: {
    color: colors.danger,
    fontSize: 12,
    paddingBottom: 4,
    textAlign: "center"
  },
  scrollArea: {
    flex: 1
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
  },
  sendBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  sendBtnDisabled: {
    opacity: 0.5
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  thinkingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingBottom: 8
  },
  thinkingText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600"
  }
});
