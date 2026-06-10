import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useWakeWord } from "@/hooks/useWakeWord";
import { AssistantOverlay } from "./AssistantOverlay";
import { DiamondVoiceIndicator } from "./DiamondVoiceIndicator";

const AssistantContext = createContext(null);

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used within AssistantProvider");
  return ctx;
}

export function AssistantProvider({ children }) {
  const [active, setActive] = useState(false);
  const [companyId, setCompanyId] = useState("all");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const activate = useCallback((overrideCompanyId) => {
    setCompanyId(overrideCompanyId || "all");
    setActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setActive(false);
    setIsSpeaking(false);
  }, []);

  const onWakeWordDetected = useCallback(() => {
    activate();
  }, [activate]);

  const wakeWord = useWakeWord({ onWakeWordDetected });

  const value = useMemo(
    () => ({
      activate, deactivate, active,
      wakeWordSupported: wakeWord.supported,
      wakeWordListening: wakeWord.listening,
      isSpeaking, setIsSpeaking
    }),
    [activate, deactivate, active, wakeWord.supported, wakeWord.listening, isSpeaking]
  );

  return (
    <AssistantContext.Provider value={value}>
      {children}

      <AssistantOverlay
        companyId={companyId}
        onDismiss={deactivate}
        visible={active}
        onSpeakingChange={setIsSpeaking}
      />

      {!active ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          pointerEvents="box-none"
          style={styles.container}
        >
          <Pressable
            accessibilityLabel="Activate voice assistant"
            accessibilityRole="button"
            onPress={() => activate()}
            style={({ pressed }) => [styles.touchArea, pressed && styles.pressed]}
          >
            <DiamondVoiceIndicator
              active={wakeWord.listening}
              isSpeaking={false}
            />
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          pointerEvents="box-none"
          style={styles.container}
        >
          <DiamondVoiceIndicator active={true} isSpeaking={isSpeaking} />
        </Animated.View>
      )}
    </AssistantContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    bottom: 40,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 100
  },
  pressed: {
    opacity: 0.8
  },
  touchArea: {
    alignItems: "center",
    justifyContent: "center"
  }
});
