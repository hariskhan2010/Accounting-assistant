import { useCallback, useState } from "react";

const starterMessages = [
  {
    id: "assistant-welcome",
    role: "assistant",
    text: "Assalamalaikom ji sir mai apki kiya madad karsakta ho."
  }
];

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useVoiceChat() {
  const [messages, setMessages] = useState(starterMessages);

  const appendMessage = useCallback((roleOrMessage, text, meta = {}) => {
    if (typeof roleOrMessage === "object") {
      setMessages((current) => [...current, roleOrMessage]);
      return roleOrMessage;
    }

    const message = {
      id: makeId(roleOrMessage),
      role: roleOrMessage,
      text,
      ...meta
    };
    setMessages((current) => [...current, message]);
    return message;
  }, []);

  return {
    messages,
    appendMessage
  };
}
