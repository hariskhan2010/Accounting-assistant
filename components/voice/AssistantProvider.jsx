import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useWakeWord } from "@/hooks/useWakeWord";
import { AssistantOverlay } from "./AssistantOverlay";

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

  const wakeWord = useWakeWord({});

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
    </AssistantContext.Provider>
  );
}

