import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
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
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(false);
  const [companyId, setCompanyId] = useState("all");
  const [indicatorVisible, setIndicatorVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const indicatorOpacity = useSharedValue(0);
  const indicatorRotate = useSharedValue(0);
  const indicatorTranslateY = useSharedValue(180);

  const activate = useCallback((overrideCompanyId) => {
    setCompanyId(overrideCompanyId || "all");
    setActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setActive(false);
    setIsSpeaking(false);
  }, []);

  const onWakeWordDetected = useCallback(() => {
    setIndicatorVisible(true);
  }, []);

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

  useEffect(() => {
    if (!indicatorVisible || active) return;

    indicatorOpacity.value = 0;
    indicatorRotate.value = 0;
    indicatorTranslateY.value = 180;
    indicatorOpacity.value = withTiming(1, { duration: 220 });
    indicatorTranslateY.value = withTiming(0, { duration: 700 });
    indicatorRotate.value = withTiming(360, { duration: 700 });
  }, [active, indicatorOpacity, indicatorRotate, indicatorTranslateY, indicatorVisible]);

  const indicatorEntranceStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [
      { translateY: indicatorTranslateY.value },
      { rotate: `${indicatorRotate.value}deg` }
    ]
  }));

  return (
    <AssistantContext.Provider value={value}>
      {children}

      <AssistantOverlay
        companyId={companyId}
        onDismiss={deactivate}
        visible={active}
        onSpeakingChange={setIsSpeaking}
      />

      {!active && indicatorVisible ? (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          pointerEvents="none"
          style={[styles.container, width < 390 && styles.containerCompact]}
        >
          <View style={styles.touchArea}>
            <Animated.View style={indicatorEntranceStyle}>
              <DiamondVoiceIndicator
                active={wakeWord.listening}
                isSpeaking={false}
              />
            </Animated.View>
          </View>
        </Animated.View>
      ) : (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          pointerEvents="box-none"
          style={[styles.container, width < 390 && styles.containerCompact]}
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
    bottom: 92,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 100
  },
  containerCompact: {
    bottom: 68
  },
  touchArea: {
    alignItems: "center",
    justifyContent: "center"
  }
});
