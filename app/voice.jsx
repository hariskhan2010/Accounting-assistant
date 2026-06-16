import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { FadeInView } from "@/components/animated/FadeInView";
import { StaggerList } from "@/components/animated/StaggerList";
import { Ionicons } from "@expo/vector-icons";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChatBubble } from "@/components/voice/ChatBubble";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { useGeminiLiveAgent } from "@/hooks/useGeminiLiveAgent";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { colors } from "@/theme";

export default function VoiceScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [textInput, setTextInput] = useState("");
  const inputRef = useRef(null);
  const { messages, appendMessage } = useVoiceChat(companyFilter);
  const liveAgent = useGeminiLiveAgent({
    companyId: companyFilter,
    onMessage: appendMessage
  });

  const handleSendText = () => {
    const text = textInput.trim();
    if (!text) return;
    appendMessage("user", text, { source: "text" });
    liveAgent.sendUserText(text);
    setTextInput("");
  };

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
              <Text style={styles.emptyTitle}>Live Financial Assistant</Text>
              <Text style={styles.emptyHint}>Press Live and ask accounting questions by voice.</Text>
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
      </ScrollView>
      <FadeInView delay={100} direction="up">
        <View style={styles.footer}>
          <Text style={styles.hint}>{liveAgent.status}</Text>
          {liveAgent.error ? <Text style={styles.error}>{liveAgent.error}</Text> : null}
          <View style={styles.voiceActions}>
            <View style={styles.voiceAction}>
              <Text style={styles.actionLabel}>Live</Text>
              <VoiceButton active={liveAgent.connected || liveAgent.connecting} onPress={liveAgent.toggle} />
            </View>
          </View>
          {liveAgent.connected && liveAgent.textMode ? (
            <View style={styles.textInputRow}>
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                placeholder="Type your question in Urdu or English..."
                placeholderTextColor={colors.textMuted}
                value={textInput}
                onChangeText={setTextInput}
                onSubmitEditing={handleSendText}
                returnKeyType="send"
              />
              <Pressable onPress={handleSendText} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color={colors.background} />
              </Pressable>
            </View>
          ) : null}
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
  messages: {
    flexGrow: 1,
    gap: 12,
    padding: 16
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1
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
  },
  textInputRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%"
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
  sendBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 42,
    justifyContent: "center",
    width: 42
  }
});
