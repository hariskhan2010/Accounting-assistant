import { useCallback, useEffect, useRef, useState } from "react";
import { buildVoiceBusinessContext } from "@/modules/voice/businessContext";
import * as Audio from "expo-av";
import {
  buildGeminiLiveSetup,
  buildGeminiLiveUrl,
  GEMINI_LIVE_INPUT_SAMPLE_RATE,
  GEMINI_LIVE_OUTPUT_SAMPLE_RATE,
  getGeminiLiveToken
} from "@/services/geminiLive";

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function downsampleBuffer(input, inputSampleRate, outputSampleRate) {
  if (outputSampleRate === inputSampleRate) return input;

  const sampleRateRatio = inputSampleRate / outputSampleRate;
  const outputLength = Math.round(input.length / sampleRateRatio);
  const output = new Float32Array(outputLength);

  let inputOffset = 0;
  for (let outputOffset = 0; outputOffset < output.length; outputOffset += 1) {
    const nextInputOffset = Math.round((outputOffset + 1) * sampleRateRatio);
    let sum = 0;
    let count = 0;

    for (let i = inputOffset; i < nextInputOffset && i < input.length; i += 1) {
      sum += input[i];
      count += 1;
    }

    output[outputOffset] = count ? sum / count : 0;
    inputOffset = nextInputOffset;
  }

  return output;
}

function floatTo16BitPcm(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < float32Array.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  return buffer;
}

function pcm16ToFloat32(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const output = new Float32Array(arrayBuffer.byteLength / 2);

  for (let i = 0; i < output.length; i += 1) {
    output[i] = view.getInt16(i * 2, true) / 0x8000;
  }

  return output;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return globalThis.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}

export function useGeminiLiveAgent({ companyId = "all", onMessage }) {
  const audioContextRef = useRef(null);
  const inputRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const nextPlaybackTimeRef = useRef(0);
  const outputSourcesRef = useRef([]);
  const processorRef = useRef(null);
  const socketRef = useRef(null);
  const connectedRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState("Gemini Live ready");
  const [error, setError] = useState("");
  const [textMode, setTextMode] = useState(false);
  const isTextMode = useRef(false);
  const greetingSent = useRef(false);
  const pendingInputText = useRef("");

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  const emitMessage = useCallback(
    (role, text) => {
      if (!text) return;
      onMessage?.({
        id: makeId(`gemini-live-${role}`),
        role,
        text,
        source: "gemini-live"
      });
    },
    [onMessage]
  );

  const pendingInputTimer = useRef(null);

  const flushPendingInput = useCallback(() => {
    if (pendingInputText.current) {
      onMessage?.({
        id: makeId("gemini-live-user"),
        role: "user",
        text: pendingInputText.current,
        source: "gemini-live"
      });
      pendingInputText.current = "";
    }
    pendingInputTimer.current = null;
  }, [onMessage]);

  const queueUserInput = useCallback(
    (text) => {
      if (!text) return;
      pendingInputText.current = text;
      if (pendingInputTimer.current) clearTimeout(pendingInputTimer.current);
      pendingInputTimer.current = setTimeout(flushPendingInput, 500);
    },
    [flushPendingInput]
  );

  const stopPlayback = useCallback(() => {
    outputSourcesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch {}
    });
    outputSourcesRef.current = [];
    nextPlaybackTimeRef.current = audioContextRef.current?.currentTime || 0;
  }, []);

  const stop = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (inputRef.current) {
      inputRef.current.disconnect();
      inputRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (pendingInputTimer.current) {
      clearTimeout(pendingInputTimer.current);
      pendingInputTimer.current = null;
    }

    pendingInputText.current = "";
    stopPlayback();
    setConnected(false);
    setConnecting(false);
    setStatus("Gemini Live stopped");
  }, [stopPlayback]);

  const playPcmChunk = useCallback(async (base64Audio) => {
    if (!base64Audio) return;
    const arrayBuffer = base64ToArrayBuffer(base64Audio);
    if (!arrayBuffer.byteLength) return;

    const audioContext = audioContextRef.current;
    if (audioContext) {
      const samples = pcm16ToFloat32(arrayBuffer);
      const audioBuffer = audioContext.createBuffer(1, samples.length, GEMINI_LIVE_OUTPUT_SAMPLE_RATE);
      audioBuffer.copyToChannel(samples, 0);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        outputSourcesRef.current = outputSourcesRef.current.filter((item) => item !== source);
      };

      const startAt = Math.max(audioContext.currentTime, nextPlaybackTimeRef.current);
      source.start(startAt);
      outputSourcesRef.current.push(source);
      nextPlaybackTimeRef.current = startAt + audioBuffer.duration;
      return;
    }

    if (isTextMode.current) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/pcm;base64,${base64Audio}` },
          { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) sound.unloadAsync();
        });
      } catch {}
    }
  }, []);

  const handleServerMessage = useCallback(
    async (event) => {
      const response = JSON.parse(event.data);

      if (response.setupComplete) {
        setStatus("Gemini Live listening");
        if (!greetingSent.current && socketRef.current?.readyState === globalThis.WebSocket.OPEN) {
          greetingSent.current = true;
          socketRef.current.send(JSON.stringify({
            realtimeInput: {
              text: "Assalamalaikom"
            }
          }));
        }
        return;
      }

      if (response.serverContent?.interrupted) {
        stopPlayback();
        if (pendingInputText.current) flushPendingInput();
        setStatus("User speaking");
        return;
      }

      if (response.serverContent?.inputTranscription?.text) {
        queueUserInput(response.serverContent.inputTranscription.text);
        return;
      }

      if (pendingInputText.current) {
        flushPendingInput();
      }

      if (response.serverContent?.outputTranscription?.text) {
        emitMessage("assistant", response.serverContent.outputTranscription.text);
      }

      const parts = response.serverContent?.modelTurn?.parts || [];
      if (parts.length) {
        setStatus("Gemini speaking");
      }

      for (const part of parts) {
        if (part.inlineData?.data) {
          await playPcmChunk(part.inlineData.data);
        }
      }

      if (response.serverContent?.turnComplete) {
        setStatus("Gemini Live listening");
      }

      if (response.goAway?.timeLeft) {
        setStatus("Gemini Live session ending soon");
      }
    },
    [emitMessage, flushPendingInput, playPcmChunk, queueUserInput, stopPlayback]
  );

  const start = useCallback(async () => {
    try {
      setError("");
      setConnecting(true);
      setStatus("Creating Gemini Live session");

      const { token, model, error: tokenError } = await getGeminiLiveToken();
      if (tokenError) throw tokenError;

      const context = await buildVoiceBusinessContext(companyId);

      greetingSent.current = false;

      let hasAudio = false;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioContextRef.current = ctx;
        nextPlaybackTimeRef.current = ctx.currentTime;
        hasAudio = true;
      } catch {
        isTextMode.current = true;
        setTextMode(true);
      }

      const socket = new globalThis.WebSocket(buildGeminiLiveUrl(token));
      socketRef.current = socket;

      socket.onopen = async () => {
        socket.send(JSON.stringify(buildGeminiLiveSetup(model, context)));

        if (!hasAudio) {
          setStatus("Connected (text mode — type your questions)");
          setConnected(true);
          setConnecting(false);
          return;
        }

        try {
          setStatus("Opening microphone");
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          mediaStreamRef.current = mediaStream;

          const audioContext = audioContextRef.current;
          const input = audioContext.createMediaStreamSource(mediaStream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (audioEvent) => {
            if (socket.readyState !== globalThis.WebSocket.OPEN) return;

            const inputData = audioEvent.inputBuffer.getChannelData(0);
            const downsampled = downsampleBuffer(inputData, audioContext.sampleRate, GEMINI_LIVE_INPUT_SAMPLE_RATE);
            const pcmBuffer = floatTo16BitPcm(downsampled);
            socket.send(JSON.stringify({
              realtimeInput: {
                audio: {
                  data: arrayBufferToBase64(pcmBuffer),
                  mimeType: `audio/pcm;rate=${GEMINI_LIVE_INPUT_SAMPLE_RATE}`
                }
              }
            }));
          };

          input.connect(processor);
          processor.connect(audioContext.destination);
          inputRef.current = input;
          processorRef.current = processor;
        } catch {
          setStatus("Connected (text mode — mic unavailable)");
        }

        setConnected(true);
        setConnecting(false);
      };

      socket.onmessage = handleServerMessage;
      socket.onerror = () => {
        setError("Gemini Live WebSocket failed.");
        setStatus("Gemini Live error");
      };
      socket.onclose = () => {
        setConnected(false);
        setConnecting(false);
        setStatus("Gemini Live disconnected");
      };
    } catch (agentError) {
      stop();
      setError(agentError.message);
      setStatus("Gemini Live failed");
    }
  }, [companyId, handleServerMessage, stop]);

  const sendUserText = useCallback((text) => {
    const socket = socketRef.current;
    if (!text.trim() || !socket || socket.readyState !== globalThis.WebSocket.OPEN) return false;

    socket.send(JSON.stringify({
      realtimeInput: {
        text: text.trim()
      }
    }));
    return true;
  }, []);

  const toggle = useCallback(() => {
    if (connected || connecting) {
      stop();
      return;
    }

    start();
  }, [connected, connecting, start, stop]);

  useEffect(() => stop, [stop]);

  return {
    connected,
    connecting,
    status,
    error,
    textMode,
    sendUserText,
    toggle,
    startAgent: start,
    stopAgent: stop
  };
}
