import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { FadeInView } from "@/components/animated/FadeInView";
import { StaggerList } from "@/components/animated/StaggerList";
import { Ionicons } from "@expo/vector-icons";
import { LuxuryScreenHeader } from "@/components/layout/LuxuryScreenHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ChatBubble } from "@/components/voice/ChatBubble";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { buildVoiceBusinessContext } from "@/modules/voice/businessContext";
import { askGeminiInUrdu } from "@/services/gemini";
import { executeAction } from "@/modules/voice/actionExecutor";
import { extractCompany, parseCommand } from "@/modules/voice/intentHandler";
import { COMPANY_FILTERS } from "@/modules/accounting/constants";
import { colors } from "@/theme";

const WELCOME_TEXT = "Assalamalaikom! Mai aapka financial assistant hoon. Aap kya poochna chahenge?";

export default function VoiceScreen() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [textInput, setTextInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const inputRef = useRef(null);
  const initialized = useRef(false);
  const pendingCommand = useRef(null);
  const { messages, appendMessage } = useVoiceChat(companyFilter);

  const askCompany = useCallback((command) => {
    const typeLabel = {
      add_purchase: "purchase",
      add_sale: "sale",
      add_expense: "expense",
      add_mineral: "mineral",
      add_staff: "staff",
      pay_salary: "salary"
    }[command.intent] || "entry";

    pendingCommand.current = command;
    appendMessage({
      id: `ask-company-${Date.now()}`,
      role: "assistant",
      text: `Kis mein ${typeLabel} add karo? **Self** ya **Company**?`,
      source: "action"
    });
  }, [appendMessage]);

  const executeWithCompany = useCallback((command, resolvedCompanyId) => {
    pendingCommand.current = null;
    const finalCommand = { ...command, params: { ...command.params, companyId: resolvedCompanyId } };

    executeAction(finalCommand).then((result) => {
      appendMessage({
        id: `action-${Date.now()}`,
        role: "assistant",
        text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
        source: "action"
      });
    });
  }, [appendMessage]);

  const handleSendText = useCallback(async () => {
    const text = textInput.trim();
    if (!text || thinking) return;

    setTextInput("");
    appendMessage("user", text, { source: "text" });

    if (pendingCommand.current) {
      const detectedCompany = extractCompany(text);
      if (detectedCompany) {
        executeWithCompany(pendingCommand.current, detectedCompany);
      } else {
        appendMessage({
          id: `ask-again-${Date.now()}`,
          role: "assistant",
          text: "Mujhe samajh nahi aaya. **Self** mein add karo ya **Company** mein?",
          source: "action"
        });
      }
      return;
    }

    const command = parseCommand(text);

    if (command.type === "action") {
      if (!command.params.companyId) {
        askCompany(command);
        return;
      }

      setThinking(true);
      const result = await executeAction(command);
      appendMessage({
        id: `action-${Date.now()}`,
        role: "assistant",
        text: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
        source: "action"
      });
      return;
    }

    setThinking(true);

    try {
      const context = await buildVoiceBusinessContext(companyFilter);
      const { answer } = await askGeminiInUrdu({ transcript: text, context });
      if (answer) {
        appendMessage("assistant", answer, { source: "gemini-api" });
      }
    } catch {
      appendMessage("assistant", "Sorry, main aap ki madad nahi kar saka. Dobara koshish karein.", { source: "error" });
    } finally {
      setThinking(false);
    }
  }, [textInput, thinking, companyFilter, appendMessage, askCompany, executeWithCompany]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    appendMessage({ id: "welcome", role: "assistant", text: WELCOME_TEXT, source: "local" });
  }, [companyFilter, appendMessage]);

  return (
    <View style={styles.screen}>
      <View style={styles.headerArea}>
        <LuxuryScreenHeader colorIndex={8} title="AI Assistant" subtitle="Roman Urdu mein poochhein — add karein, poochhein, jaanein" />
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
              <Text style={styles.emptyHint}>Type a question or command in Roman Urdu.</Text>
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
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Roman Urdu mein type karein..."
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
