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
import { useGeminiLiveAgent } from "@/hooks/useGeminiLiveAgent";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { buildVoiceBusinessContext } from "@/modules/voice/businessContext";
import { askGeminiInUrdu } from "@/services/gemini";
import { isSupabaseConfigured, requireSupabase } from "@/services/supabase";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { colors } from "@/theme";

async function speakText(text) {
  if (!isSupabaseConfigured || !text) return;
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
    }
  } catch {}
}

export default function VoiceScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [textInput, setTextInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef(null);
  const greeted = useRef(false);
  const { messages, appendMessage } = useVoiceChat(companyFilter);
  const liveAgent = useGeminiLiveAgent({
    companyId: companyFilter,
    onMessage: appendMessage
  });

  useEffect(() => {
    if (greeted.current) return;

    const timer = setTimeout(async () => {
      if (greeted.current) return;
      greeted.current = true;

      const context = await buildVoiceBusinessContext(companyFilter).catch(() => ({
        currentDate: new Date().toISOString().slice(0, 10),
        entityName: "آپ کا کاروبار",
        monthRevenue: "0",
        monthPurchases: "0",
        monthExpenses: "0",
        monthSalaries: "0",
        monthMineralProfit: "0",
        monthNetProfit: "0",
        closingBalance: "0",
        totalStockQuantity: 0
      }));

      const { answer } = await askGeminiInUrdu({ transcript: "start conversation", context }).catch(() => ({ answer: "" }));

      const text = answer || "Assalamalaikom! Mai aapka financial assistant hoon. Aap kya poochna chahenge?";
      appendMessage({ id: `welcome-${Date.now()}`, role: "assistant", text, source: "gemini-api" });
      speakText(text);
    }, 500);

    return () => clearTimeout(timer);
  }, [companyFilter, appendMessage]);

  const handleSendText = useCallback(async () => {
    const text = textInput.trim();
    if (!text || thinking) return;

    setTextInput("");
    appendMessage("user", text, { source: "text" });
    liveAgent.sendUserText(text);
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
  }, [textInput, thinking, companyFilter, appendMessage, liveAgent.sendUserText]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        <LuxuryScreenHeader colorIndex={8} title="Live Voice Assistant" subtitle="Speak in English, Urdu, or Roman Urdu" />
        <FadeInView delay={80}>
          <SegmentedControl options={COMPANY_FILTERS} value={companyFilter} onChange={setCompanyFilter} />
        </FadeInView>
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
      <FadeInView delay={100} direction="up">
        <View style={styles.footer}>
          <Text style={styles.hint}>{liveAgent.status}</Text>
          {liveAgent.error ? <Text style={styles.error}>{liveAgent.error}</Text> : null}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Type your question in Urdu or English..."
              placeholderTextColor={colors.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleSendText}
              returnKeyType="send"
              editable={!thinking}
            />
            <Pressable onPress={handleSendText} disabled={thinking} style={[styles.sendBtn, thinking && styles.sendBtnDisabled]}>
              <Ionicons name="send" size={20} color={colors.background} />
            </Pressable>
          </View>
          <View style={styles.voiceActions}>
            <View style={styles.voiceAction}>
              <Text style={styles.actionLabel}>Live</Text>
              <VoiceButton active={liveAgent.connected || liveAgent.connecting} onPress={liveAgent.toggle} />
            </View>
          </View>
        </View>
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase"
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
  error: {
    color: colors.danger,
    fontSize: 12,
    textAlign: "center"
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    gap: 14,
    padding: 18
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
  hint: {
    color: colors.textMuted,
    textAlign: "center"
  },
  inputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%"
  },
  messages: {
    flexGrow: 1,
    gap: 12,
    padding: 16
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
  },
  voiceAction: {
    alignItems: "center",
    gap: 8
  },
  voiceActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 24,
    justifyContent: "center"
  }
});
