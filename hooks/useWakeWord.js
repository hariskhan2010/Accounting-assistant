import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

const WAKE_PHRASES = [
  "hey accountant",
  "ok accountant",
  "accountant",
  "hey assistant",
  "hey siri",
  "ok assistant",
  "hey a sista",
  "asistent",
  "hey a sistant",
  "assistant"
];

export function useWakeWord({ onWakeWordDetected }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const listeningRef = useRef(false);
  const onDetectedRef = useRef(onWakeWordDetected);
  onDetectedRef.current = onWakeWordDetected;

  useEffect(() => {
    if (Platform.OS !== "web") {
      setSupported(false);
      return;
    }

    const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const stopListening = useCallback(() => {
    if (Platform.OS !== "web") {
      listeningRef.current = false;
      setListening(false);
      return;
    }

    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
    listeningRef.current = false;
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (Platform.OS !== "web") {
      setListening(false);
      return;
    }

    const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    stopListening();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0].transcript.toLowerCase().trim();
          const isFinal = event.results[i].isFinal;

          if (isFinal && WAKE_PHRASES.some((phrase) => transcript.includes(phrase))) {
            onDetectedRef.current?.();
          }
        }
      };

      recognition.onerror = () => {};
      recognition.onend = () => {
        if (listeningRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      listeningRef.current = true;
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [stopListening]);

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [startListening, stopListening]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState.match(/inactive|background/)) {
        stopListening();
      } else {
        startListening();
      }
    });
    return () => sub.remove();
  }, [startListening, stopListening]);

  return { supported, listening, startListening, stopListening };
}
