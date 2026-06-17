import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeOut, SlideInUp, SlideOutDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useGeminiLiveAgent } from "@/hooks/useGeminiLiveAgent";
import { useVoiceChat } from "@/hooks/useVoiceChat";
import { executeAction } from "@/modules/voice/actionExecutor";
import { extractCompany, parseCommand } from "@/modules/voice/intentHandler";
import { colors } from "@/theme";
import { ChatBubble } from "./ChatBubble";
import { VoiceButton } from "./VoiceButton";

const WAVE_BARS = 7;

function Waveform() {
  const phases = useMemo(() => WAVE_BARS.map(() => Math.random() * 100), []);

  return (
    <View style={waveStyles.container}>
      {Array.from({ length: WAVE_BARS }).map((_, i) => (
        <WaveBar key={i} phase={phases[i]} index={i} />
      ))}
    </View>
  );
}

function WaveBar({ phase }) {
  const height = useSharedValue(8);

  useEffect(() => {
    height.value = withRepeat(
      withTiming(28 + phase * 0.6, { duration: 600 + phase * 8 }),
      -1,
      true
    );
  }, [height, phase]);

  const animStyle = useAnimatedStyle(() => ({
    height: height.value
  }));

  return (
    <Animated.View style={[waveStyles.bar, animStyle]} />
  );
}

const waveStyles = StyleSheet.create({
  bar: {
    backgroundColor: colors.primary,
    borderRadius: 3,
    width: 4
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    height: 50,
    justifyContent: "center"
  }
});

export function AssistantOverlay({ visible, companyId, onDismiss, onSpeakingChange }) {
  if (!visible) return null;
  return <AssistantOverlayInner companyId={companyId} onDismiss={onDismiss} onSpeakingChange={onSpeakingChange} />;
}

function AssistantOverlayInner({ companyId, onDismiss, onSpeakingChange }) {
  const { messages, appendMessage } = useVoiceChat();
  const skipNextUser = useRef(false);
  const pendingCommand = useRef(null);
  const scrollRef = useRef(null);

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
        text: `✅ ${result.message}`,
        source: "action"
      });
    });
  }, [appendMessage]);

  const handleMessage = useCallback(
    (msg) => {
      if (msg.role === "user") {
        if (skipNextUser.current) {
          skipNextUser.current = false;
          return;
        }

        if (pendingCommand.current) {
          const detectedCompany = extractCompany(msg.text);
          if (detectedCompany) {
            appendMessage({ ...msg, source: "gemini-live" });
            executeWithCompany(pendingCommand.current, detectedCompany);
          } else {
            appendMessage(msg);
            appendMessage({
              id: `ask-again-${Date.now()}`,
              role: "assistant",
              text: "Mujhe samajh nahi aaya. **Self** mein add karo ya **Company** mein?",
              source: "action"
            });
          }
          return;
        }

        const command = parseCommand(msg.text);

        if (command.type === "action") {
          appendMessage({ ...msg, source: "gemini-live" });

          if (!command.params.companyId) {
            askCompany(command);
            return;
          }

          executeAction(command).then((result) => {
            appendMessage({
              id: `action-${Date.now()}`,
              role: "assistant",
              text: `✅ ${result.message}`,
              source: "action"
            });
          });
          return;
        }

        appendMessage(msg);
        return;
      }

      appendMessage(msg);
    },
    [appendMessage, askCompany, executeWithCompany]
  );

  const liveAgentRef = useRef(null);
  const liveAgent = useGeminiLiveAgent({
    companyId: companyId || "all",
    onMessage: handleMessage
  });
  liveAgentRef.current = liveAgent;

  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(liveAgent.status === "Gemini speaking");
    }
  }, [liveAgent.status, onSpeakingChange]);

  useEffect(() => {
    globalThis.setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(250)}
      style={styles.backdrop}
    >
      <Animated.View
        entering={SlideInUp.duration(400)}
        exiting={SlideOutDown.duration(300)}
        style={styles.panel}
      >
        <View style={styles.handle}>
          <Pressable
            accessibilityLabel="Close assistant"
            accessibilityRole="button"
            hitSlop={20}
            onPress={onDismiss}
            style={styles.closeBtn}
          >
            <Ionicons name="chevron-down" size={28} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.panelTitle}>Voice Assistant</Text>
        </View>

        <View style={styles.waveArea}>
          <Waveform />
          <Text style={styles.status}>
            {liveAgent.connected ? "Listening..." : "Press mic to speak"}
          </Text>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
          style={styles.chatScroll}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} role={msg.role} text={msg.text} />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          {liveAgent.error ? <Text style={styles.error}>{liveAgent.error}</Text> : null}
          <VoiceButton active={liveAgent.connected || liveAgent.connecting} onPress={liveAgent.toggle} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 9999
  },
  chatArea: {
    flexGrow: 1,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  chatScroll: {
    flex: 1
  },
  closeBtn: {
    alignItems: "center",
    alignSelf: "center",
    height: 40,
    justifyContent: "center",
    width: 40
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
    gap: 8,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 16
  },
  handle: {
    alignItems: "center",
    gap: 4,
    paddingTop: 12
  },
  panel: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    marginTop: 80
  },
  panelTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  status: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
    textAlign: "center"
  },
  waveArea: {
    alignItems: "center",
    paddingTop: 16
  }
});
