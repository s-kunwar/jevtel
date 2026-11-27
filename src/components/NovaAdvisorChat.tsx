import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  AudioLines,
  MessageSquareText,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { TINY_SWORDS_AVATARS } from '../game/assets';

export interface NovaChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  viaVoice?: boolean;
}

export interface NovaFastModeProfile {
  primaryLife: string;
  secondaryLife?: string;
  priorities: string[];
  budgetLabel: string;
  storeFilter: string;
  matchedModel: string;
  matchedSku: string;
  matchedRetailer: string;
  matchedPrice: string;
  stretchModel?: string;
  activeShowdownRound: string;
}

export interface NovaKioskContext {
  appMode?: 'fast' | 'pro';
  hasCompletedQuest: boolean;
  matchSource: 'builder' | 'quest';
  processorLabel: string;
  graphicsLabel: string;
  memoryLabel: string;
  storageLabel: string;
  scenarioLabel: string;
  matchedTierName: string;
  fastModeProfile?: NovaFastModeProfile;
}

interface NovaAdvisorChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arcadeOpen: boolean;
  sessionNonce: number;
  queuedPrompt: { id: number; text: string } | null;
  kioskContext: NovaKioskContext;
}

type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking';

const STORAGE_KEY = 'jevtel_nova_history_v1';

const FAST_INITIAL_GREETING: NovaChatMessage = {
  id: 'nova-welcome',
  role: 'model',
  text: `Hey! I'm **NOVA**, your store shopping friend. Ask me anything in plain English—like whether a laptop lasts 4 years or runs Tally and Canva without lag!`,
};

const PRO_INITIAL_GREETING: NovaChatMessage = {
  id: 'nova-welcome',
  role: 'model',
  text: `Hey! I'm **NOVA**, your Intel AI PC advisor here at the kiosk. Type or tap **Voice** to talk—tell me what you'll mostly use your laptop for (college, editing, gaming, or daily multitasking) and your rough budget!`,
};

const FAST_QUICK_STARTERS = [
  'Will this last 4 years?',
  'Why not a ₹55k laptop instead?',
  'Does AI work without internet?',
  'Will it run Tally, Canva & Photoshop?',
];

const PRO_QUICK_STARTERS = [
  'Best laptop for college & AI?',
  'Why Core Ultra vs a cheaper laptop?',
  'Need one for editing & gaming',
  'Review my current setup',
];

function encodeFloat32ToPcm16Base64(input: Float32Array, inputSampleRate: number): string {
  const targetRate = 16000;
  let samples = input;

  if (inputSampleRate !== targetRate && inputSampleRate > 0) {
    const ratio = inputSampleRate / targetRate;
    const newLength = Math.max(1, Math.round(input.length / ratio));
    const downsampled = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
      const srcIndex = Math.min(input.length - 1, Math.floor(i * ratio));
      downsampled[i] = input[srcIndex];
    }
    samples = downsampled;
  }

  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function decodePcm16Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const byteLength = binary.length;
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const sampleCount = Math.floor(byteLength / 2);
  const float32 = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

function renderBoldInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-[#111827] dark:text-[#F8FAFC]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

function FormattedNovaText({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trimEnd());
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (keyPrefix: string) => {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={keyPrefix} className="my-1.5 space-y-1 pl-4 text-[13px] leading-relaxed">
        {bulletBuffer.map((item, idx) => (
          <li key={idx} className="list-disc marker:text-[#0068B5] dark:marker:text-[#38BDF8]">
            {renderBoldInline(item)}
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushBullets(`b-${idx}`);
      return;
    }

    const bulletMatch = trimmed.match(/^(?:[-•*]|\d+\.)\s+(.*)$/);
    if (bulletMatch) {
      bulletBuffer.push(bulletMatch[1]);
      return;
    }

    flushBullets(`p-${idx}`);

    const isStoreRepLine = /show to store rep|next step:/i.test(trimmed);
    if (isStoreRepLine) {
      blocks.push(
        <div
          key={`rep-${idx}`}
          className="mt-2 rounded-lg border border-[#BAE6FD] bg-[#EFF6FF] px-3 py-2 text-[12px] font-medium leading-relaxed text-[#0F172A] dark:border-[#1E3A8A] dark:bg-[#0F172A] dark:text-[#E2E8F0]"
        >
          {renderBoldInline(trimmed)}
        </div>
      );
      return;
    }

    blocks.push(
      <p key={`line-${idx}`} className="text-[13px] leading-relaxed [&:not(:first-child)]:mt-1.5">
        {renderBoldInline(trimmed)}
      </p>
    );
  });

  flushBullets('end');
  return <div>{blocks}</div>;
}

const WAVE_BAR_WEIGHTS = [0.45, 0.78, 1.0, 0.68, 0.92, 0.72, 0.48];

export function NovaAdvisorChat({
  open,
  onOpenChange,
  arcadeOpen,
  sessionNonce,
  queuedPrompt,
  kioskContext,
}: NovaAdvisorChatProps) {
  const isFastMode = kioskContext.appMode === 'fast';
  const defaultGreeting = isFastMode ? FAST_INITIAL_GREETING : PRO_INITIAL_GREETING;
  const activeQuickStarters = isFastMode ? FAST_QUICK_STARTERS : PRO_QUICK_STARTERS;

  const [messages, setMessages] = useState<NovaChatMessage[]>(() => {
    if (typeof window === 'undefined') return [defaultGreeting];
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NovaChatMessage[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage read failure
    }
    return [defaultGreeting];
  });

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live API voice state
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const lastProcessedNonceRef = useRef<number>(sessionNonce);
  const lastProcessedPromptIdRef = useRef<number | null>(null);
  const messagesRef = useRef<NovaChatMessage[]>(messages);
  messagesRef.current = messages;
  const sendingRef = useRef(false);
  sendingRef.current = isSending;

  // Live audio/WS refs to prevent stale closures in Web Audio callbacks
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const zeroGainRef = useRef<GainNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micMutedRef = useRef<boolean>(false);
  const voiceStateRef = useRef<VoiceState>('idle');
  const activeUserVoiceIdRef = useRef<string | null>(null);
  const activeModelVoiceIdRef = useRef<string | null>(null);
  const kioskContextRef = useRef<NovaKioskContext>(kioskContext);
  kioskContextRef.current = kioskContext;

  useEffect(() => {
    micMutedRef.current = micMuted;
  }, [micMuted]);

  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  const clearPlaybackQueue = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore stop error
      }
    }
    activeSourcesRef.current.clear();
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  }, []);

  const stopVoiceSession = useCallback(() => {
    activeUserVoiceIdRef.current = null;
    activeModelVoiceIdRef.current = null;

    if (processorRef.current) {
      try {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
      } catch {
        // ignore
      }
      processorRef.current = null;
    }

    if (zeroGainRef.current) {
      try {
        zeroGainRef.current.disconnect();
      } catch {
        // ignore
      }
      zeroGainRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (
          wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING
        ) {
          wsRef.current.close();
        }
      } catch {
        // ignore
      }
      wsRef.current = null;
    }

    clearPlaybackQueue();

    if (inputCtxRef.current) {
      void inputCtxRef.current.close().catch(() => undefined);
      inputCtxRef.current = null;
    }

    if (outputCtxRef.current) {
      void outputCtxRef.current.close().catch(() => undefined);
      outputCtxRef.current = null;
    }

    setVoiceState('idle');
    setMicMuted(false);
    setAudioLevel(0);
  }, [clearPlaybackQueue]);

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  useEffect(() => {
    if ((!open || arcadeOpen) && voiceStateRef.current !== 'idle') {
      stopVoiceSession();
    }
  }, [open, arcadeOpen, stopVoiceSession]);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
    } catch {
      // ignore storage write failure
    }
  }, [messages]);

  useEffect(() => {
    if (sessionNonce !== lastProcessedNonceRef.current) {
      lastProcessedNonceRef.current = sessionNonce;
      stopVoiceSession();
      setMessages([defaultGreeting]);
      setInput('');
      setErrorMsg(null);
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [sessionNonce, stopVoiceSession, defaultGreeting]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'nova-welcome' && prev[0].text !== defaultGreeting.text) {
        return [defaultGreeting];
      }
      return prev;
    });
  }, [defaultGreeting]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isSending, open, voiceState]);

  useEffect(() => {
    if (open && voiceState === 'idle') {
      const id = window.setTimeout(() => inputRef.current?.focus(), 140);
      return () => window.clearTimeout(id);
    }
  }, [open, voiceState]);

  const appendOrUpdateLiveTranscript = useCallback(
    (role: 'user' | 'model', chunkText: string) => {
      const cleaned = chunkText;
      if (!cleaned.trim()) return;

      const refTarget = role === 'user' ? activeUserVoiceIdRef : activeModelVoiceIdRef;
      const otherTarget = role === 'user' ? activeModelVoiceIdRef : activeUserVoiceIdRef;
      otherTarget.current = null;

      if (!refTarget.current) {
        const newId = `v-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        refTarget.current = newId;
        setMessages((prev) => [
          ...prev,
          { id: newId, role, text: cleaned.trimStart(), viaVoice: true },
        ]);
        return;
      }

      const targetId = refTarget.current;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== targetId) return m;
          const needsSpace =
            m.text.length > 0 &&
            !/\s$/.test(m.text) &&
            !/^[\s.,!?;:'")]/.test(cleaned);
          return {
            ...m,
            text: `${m.text}${needsSpace ? ' ' : ''}${cleaned.trimStart()}`,
          };
        })
      );
    },
    []
  );

  const playOutputAudioChunk = useCallback((base64Pcm: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;

    if (outCtx.state === 'suspended') {
      void outCtx.resume().catch(() => undefined);
    }

    const floatSamples = decodePcm16Base64ToFloat32(base64Pcm);
    if (floatSamples.length === 0) return;

    // Update subtle reactive level while NOVA speaks
    let sumSq = 0;
    const step = Math.max(1, Math.floor(floatSamples.length / 64));
    let count = 0;
    for (let i = 0; i < floatSamples.length; i += step) {
      sumSq += floatSamples[i] * floatSamples[i];
      count++;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, count));
    setAudioLevel(Math.min(1, rms * 3.6));

    const audioBuffer = outCtx.createBuffer(1, floatSamples.length, 24000);
    audioBuffer.getChannelData(0).set(floatSamples);

    const source = outCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    const startAt = Math.max(now + 0.015, nextStartTimeRef.current);
    nextStartTimeRef.current = startAt + audioBuffer.duration;

    activeSourcesRef.current.add(source);
    setVoiceState('speaking');

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0 && voiceStateRef.current === 'speaking') {
        setVoiceState('listening');
        setAudioLevel(0);
      }
    };

    source.start(startAt);
  }, []);

  const startVoiceSession = useCallback(async () => {
    if (voiceStateRef.current !== 'idle' || sendingRef.current) return;

    setErrorMsg(null);
    setMicMuted(false);
    micMutedRef.current = false;
    setVoiceState('connecting');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }
      if (outputCtx.state === 'suspended') {
        await outputCtx.resume();
      }

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/nova/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            context: kioskContextRef.current,
            recentHistory: messagesRef.current
              .filter((m) => m.id !== 'nova-welcome')
              .slice(-8)
              .map((m) => ({ role: m.role, text: m.text })),
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type?: string;
            data?: string;
            text?: string;
            message?: string;
          };

          if (msg.type === 'ready') {
            setVoiceState((curr) => (curr === 'connecting' ? 'listening' : curr));
            return;
          }

          if (msg.type === 'audio' && msg.data) {
            playOutputAudioChunk(msg.data);
            return;
          }

          if (msg.type === 'inputTranscript' && msg.text) {
            appendOrUpdateLiveTranscript('user', msg.text);
            return;
          }

          if (msg.type === 'outputTranscript' && msg.text) {
            appendOrUpdateLiveTranscript('model', msg.text);
            return;
          }

          if (msg.type === 'interrupted') {
            clearPlaybackQueue();
            activeModelVoiceIdRef.current = null;
            setVoiceState('listening');
            setAudioLevel(0);
            return;
          }

          if (msg.type === 'turnComplete') {
            activeUserVoiceIdRef.current = null;
            activeModelVoiceIdRef.current = null;
            return;
          }

          if (msg.type === 'error') {
            setErrorMsg(msg.message || 'NOVA Live voice hit an error. Try again.');
            stopVoiceSession();
            return;
          }

          if (msg.type === 'closed') {
            stopVoiceSession();
          }
        } catch {
          // ignore malformed WS frame
        }
      };

      ws.onerror = () => {
        setErrorMsg('Could not connect to NOVA Live voice. Please check your connection and try again.');
        stopVoiceSession();
      };

      ws.onclose = () => {
        if (voiceStateRef.current !== 'idle') {
          stopVoiceSession();
        }
      };

      const sourceNode = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      const zeroGain = inputCtx.createGain();
      zeroGain.gain.value = 0;

      processorRef.current = processor;
      zeroGainRef.current = zeroGain;

      processor.onaudioprocess = (e) => {
        if (micMutedRef.current) {
          if (activeSourcesRef.current.size === 0) setAudioLevel(0);
          return;
        }
        const activeWs = wsRef.current;
        if (!activeWs || activeWs.readyState !== WebSocket.OPEN) return;

        const channelData = e.inputBuffer.getChannelData(0);

        if (activeSourcesRef.current.size === 0) {
          let sum = 0;
          for (let i = 0; i < channelData.length; i += 16) {
            sum += channelData[i] * channelData[i];
          }
          const rms = Math.sqrt(sum / Math.max(1, channelData.length / 16));
          setAudioLevel(Math.min(1, rms * 5.2));
        }

        const base64Pcm = encodeFloat32ToPcm16Base64(channelData, inputCtx.sampleRate);
        activeWs.send(JSON.stringify({ type: 'audio', data: base64Pcm }));
      };

      sourceNode.connect(processor);
      processor.connect(zeroGain);
      zeroGain.connect(inputCtx.destination);
    } catch (err) {
      const message =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Allow mic permission in your browser to talk with NOVA.'
          : err instanceof Error
            ? err.message
            : 'Unable to start NOVA Live voice right now.';
      setErrorMsg(message);
      stopVoiceSession();
    }
  }, [appendOrUpdateLiveTranscript, clearPlaybackQueue, playOutputAudioChunk, stopVoiceSession]);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const trimmed = rawText.trim();
      if (!trimmed || sendingRef.current) return;

      if (voiceStateRef.current !== 'idle') {
        stopVoiceSession();
      }

      setErrorMsg(null);
      const userMsg: NovaChatMessage = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        text: trimmed,
      };

      const nextHistory = [...messagesRef.current, userMsg];
      setMessages(nextHistory);
      setInput('');
      setIsSending(true);
      sendingRef.current = true;

      try {
        const res = await fetch('/api/nova/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: nextHistory
              .filter((m) => m.id !== 'nova-welcome')
              .map((m) => ({ role: m.role, text: m.text })),
            context: kioskContextRef.current,
          }),
        });

        const data = (await res.json().catch(() => ({}))) as {
          reply?: string;
          error?: string;
        };

        if (!res.ok || !data.reply) {
          throw new Error(data.error || 'NOVA could not respond right now. Please try again.');
        }

        const modelMsg: NovaChatMessage = {
          id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: 'model',
          text: data.reply,
        };
        setMessages((prev) => [...prev, modelMsg]);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'NOVA hit a connection hiccup. Please try again.';
        setErrorMsg(msg);
      } finally {
        setIsSending(false);
        sendingRef.current = false;
      }
    },
    [stopVoiceSession]
  );

  useEffect(() => {
    if (
      queuedPrompt &&
      queuedPrompt.id !== lastProcessedPromptIdRef.current &&
      queuedPrompt.text.trim()
    ) {
      lastProcessedPromptIdRef.current = queuedPrompt.id;
      void sendMessage(queuedPrompt.text);
    }
  }, [queuedPrompt, sendMessage]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleResetChat = () => {
    if (isSending) return;
    stopVoiceSession();
    setMessages([defaultGreeting]);
    setErrorMsg(null);
    setInput('');
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleRetryLast = () => {
    if (isSending) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;

    setErrorMsg(null);
    setIsSending(true);
    sendingRef.current = true;

    void fetch('/api/nova/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages
          .filter((m) => m.id !== 'nova-welcome')
          .map((m) => ({ role: m.role, text: m.text })),
        context: kioskContextRef.current,
      }),
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          reply?: string;
          error?: string;
        };
        if (!res.ok || !data.reply) {
          throw new Error(data.error || 'NOVA could not respond right now.');
        }
        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: 'model',
            text: data.reply!,
          },
        ]);
      })
      .catch((err) => {
        setErrorMsg(
          err instanceof Error
            ? err.message
            : 'NOVA hit a connection hiccup. Please try again.'
        );
      })
      .finally(() => {
        setIsSending(false);
        sendingRef.current = false;
      });
  };

  if (arcadeOpen) {
    return null;
  }

  const hasUserMessages = messages.some((m) => m.role === 'user');
  const isVoiceActive = voiceState !== 'idle';

  const voiceStatusLabel =
    voiceState === 'connecting'
      ? 'Connecting NOVA Live…'
      : voiceState === 'speaking'
        ? 'NOVA Speaking · Interrupt anytime'
        : micMuted
          ? 'Mic Muted · Tap mic to speak'
          : 'Listening · Speak naturally';

  return (
    <div
      className={
        open
          ? 'fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/55 backdrop-blur-xs sm:inset-auto sm:bottom-6 sm:right-6 sm:z-40 sm:block sm:bg-transparent sm:backdrop-blur-none'
          : 'fixed bottom-4 right-4 z-40 safe-pb sm:bottom-6 sm:right-6 sm:pb-0'
      }
      onClick={(e) => {
        if (open && e.target === e.currentTarget) {
          onOpenChange(false);
        }
      }}
    >
      {!open ? (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="Open NOVA AI PC Advisor chat"
          className="group flex min-h-[48px] items-center gap-2.5 rounded-xl border-2 border-[#111827] bg-white px-3.5 py-2 text-left shadow-[4px_4px_0px_#0068B5] transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-[#38BDF8] dark:bg-[#111827] dark:shadow-[4px_4px_0px_#020617] sm:gap-3 sm:px-4 sm:py-2.5"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] dark:border-[#334155] dark:bg-[#0F172A]">
            <img
              src={TINY_SWORDS_AVATARS[0]}
              alt="NOVA Advisor"
              referrerPolicy="no-referrer"
              className="pixelated h-7 w-7 object-contain"
            />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-[#10B981]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-display text-xs font-bold tracking-wide text-[#0068B5] uppercase dark:text-[#38BDF8]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ask NOVA</span>
            </div>
            <div className="hidden text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] sm:block whitespace-nowrap">
              Chat or Talk Live
            </div>
          </div>
        </button>
      ) : (
        <section
          aria-label="NOVA Retail PC Advisor Chat"
          className="flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-3xl border-t-2 border-x-2 border-[#111827] bg-white shadow-2xl dark:border-[#38BDF8] dark:bg-[#111827] sm:h-[min(80vh,580px)] sm:w-[min(94vw,410px)] sm:rounded-2xl sm:border-2 sm:shadow-[6px_6px_0px_#0068B5] dark:sm:shadow-[6px_6px_0px_#020617]"
        >
          {/* Mobile Bottom-Sheet Drag Affordance */}
          <div
            aria-hidden="true"
            className="flex shrink-0 justify-center bg-[#FAF8F5] pt-2.5 pb-1 dark:bg-[#0F172A] sm:hidden"
          >
            <span className="h-1.5 w-10 rounded-full bg-[#CBD5E1] dark:bg-[#334155]" />
          </div>

          {/* Header */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E5E7EB] bg-[#FAF8F5] px-4 py-2.5 dark:border-[#1F2937] dark:bg-[#0F172A] sm:py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E7EB] bg-white dark:border-[#334155] dark:bg-[#1E293B]">
                <img
                  src={TINY_SWORDS_AVATARS[0]}
                  alt="NOVA"
                  referrerPolicy="no-referrer"
                  className="pixelated h-7 w-7 object-contain"
                />
                {isVoiceActive && (
                  <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#1E293B]" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-editorial text-sm font-bold text-[#111827] dark:text-[#F8FAFC]">
                    NOVA
                  </span>
                  <span className="font-mono-tabular text-[11px] font-bold text-[#059669] dark:text-[#34D399]">
                    {isVoiceActive
                      ? '· Live Voice'
                      : isFastMode
                        ? '· Shopping Friend'
                        : '· PC Advisor'}
                  </span>
                </div>
                <p className="truncate text-[11px] text-[#6B7280] dark:text-[#94A3AF]">
                  Croma · Reliance Digital · Vijay Sales
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (isVoiceActive) {
                    stopVoiceSession();
                  } else {
                    void startVoiceSession();
                  }
                }}
                disabled={isSending}
                title={isVoiceActive ? 'End Live Voice' : 'Start Live Voice Conversation'}
                aria-label={isVoiceActive ? 'End Live Voice' : 'Start Live Voice Conversation'}
                className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors disabled:opacity-40 sm:h-8 sm:px-2.5 sm:text-[11px] whitespace-nowrap shrink-0 ${
                  isVoiceActive
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2] dark:border-[#F87171] dark:bg-[#450A0A]/60 dark:text-[#FCA5A5]'
                    : 'border-[#0068B5] bg-[#0068B5] text-white hover:bg-[#005291] dark:border-[#38BDF8] dark:bg-[#0284C7] dark:hover:bg-[#0369A1]'
                }`}
              >
                <AudioLines className={`h-3.5 w-3.5 ${isVoiceActive ? 'animate-pulse' : ''}`} />
                <span>{isVoiceActive ? 'End' : 'Voice'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetChat}
                disabled={isSending}
                title="Start new conversation"
                aria-label="Start new conversation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] disabled:opacity-40 dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#94A3AF] dark:hover:border-[#38BDF8] dark:hover:text-[#F8FAFC] sm:h-8 sm:w-8"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                title="Minimize NOVA"
                aria-label="Minimize NOVA chat"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#4B5563] transition-colors hover:border-[#111827] hover:text-[#111827] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#94A3AF] dark:hover:border-[#38BDF8] dark:hover:text-[#F8FAFC] sm:h-8 sm:w-8"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Conversation Thread */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#FAF8F5]/60 px-4 py-3.5 dark:bg-[#0B1120]/70"
          >
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-xl px-3.5 py-2.5 ${
                      isUser
                        ? 'bg-[#0068B5] text-[13px] font-medium leading-relaxed text-white'
                        : 'border border-[#E5E7EB] bg-white text-[#1F2937] dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#E5E7EB]'
                    }`}
                  >
                    {msg.viaVoice && (
                      <div
                        className={`mb-1 flex items-center gap-1 font-mono-tabular text-[10px] font-bold uppercase tracking-wider ${
                          isUser
                            ? 'text-[#BAE6FD]'
                            : 'text-[#0068B5] dark:text-[#38BDF8]'
                        }`}
                      >
                        <AudioLines className="h-2.5 w-2.5" />
                        <span>Voice</span>
                      </div>
                    )}
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    ) : (
                      <FormattedNovaText text={msg.text} />
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-xs font-medium text-[#4B5563] dark:border-[#1F2937] dark:bg-[#111827] dark:text-[#94A3AF]">
                  <MessageSquareText className="h-3.5 w-3.5 animate-pulse text-[#0068B5] dark:text-[#38BDF8]" />
                  <span>NOVA is matching your setup…</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="flex items-start justify-between gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5 text-xs text-[#991B1B] dark:border-[#7F1D1D] dark:bg-[#450A0A]/60 dark:text-[#FCA5A5]"
              >
                <span className="leading-relaxed">{errorMsg}</span>
                {!isVoiceActive && messages.some((m) => m.role === 'user') && (
                  <button
                    type="button"
                    onClick={handleRetryLast}
                    className="shrink-0 rounded-md border border-[#DC2626]/30 bg-white px-2 py-1 text-[11px] font-bold text-[#B91C1C] hover:bg-[#FEE2E2] dark:border-[#F87171]/40 dark:bg-[#1E293B] dark:text-[#FCA5A5]"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Starter Quick Actions (shown before first user turn when in text mode) */}
          {!hasUserMessages && !isVoiceActive && (
            <div className="shrink-0 border-t border-[#E5E7EB] bg-white px-3.5 py-2.5 dark:border-[#1F2937] dark:bg-[#111827]">
              <div className="mb-1.5 font-mono-tabular text-[10px] font-bold tracking-wider text-[#6B7280] uppercase dark:text-[#94A3AF]">
                Quick Kiosk Questions
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {activeQuickStarters.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isSending}
                    onClick={() => void sendMessage(q)}
                    className="min-h-[40px] truncate rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2 text-left text-xs font-semibold text-[#1F2937] transition-colors hover:border-[#0068B5] hover:text-[#0068B5] disabled:opacity-50 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#D1D5DB] dark:hover:border-[#38BDF8] dark:hover:text-[#38BDF8] sm:min-h-[32px] sm:px-2.5 sm:py-1.5 sm:text-[11px]"
                    title={q}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Deck: Live Voice Acoustic Console OR Text Input Composer */}
          {isVoiceActive ? (
            <div className="shrink-0 border-t-2 border-[#0068B5] bg-[#FAF8F5] px-4 py-3.5 safe-pb dark:border-[#38BDF8] dark:bg-[#0F172A] sm:pb-3.5">
              <div className="flex items-center justify-between gap-3">
                {/* Acoustic NPU Waveform + Live Status */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 dark:border-[#334155] dark:bg-[#111827]"
                  >
                    {WAVE_BAR_WEIGHTS.map((weight, idx) => {
                      const activeScale =
                        voiceState === 'connecting'
                          ? 0.35
                          : micMuted && voiceState !== 'speaking'
                            ? 0.2
                            : Math.max(0.24, Math.min(1, 0.22 + audioLevel * weight * 0.95));
                      return (
                        <span
                          key={idx}
                          className={`w-1 rounded-full transition-all duration-100 ${
                            voiceState === 'speaking'
                              ? 'bg-[#059669] dark:bg-[#34D399]'
                              : micMuted
                                ? 'bg-[#9CA3AF] dark:bg-[#475569]'
                                : 'bg-[#0068B5] dark:bg-[#38BDF8]'
                          }`}
                          style={{
                            height: `${Math.round(activeScale * 22)}px`,
                          }}
                        />
                      );
                    })}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate font-mono-tabular text-[11px] font-bold text-[#111827] dark:text-[#F8FAFC]">
                      {voiceStatusLabel}
                    </div>
                    <div className="truncate text-[11px] text-[#6B7280] dark:text-[#94A3AF]">
                      Spoken turns appear in chat above
                    </div>
                  </div>
                </div>

                {/* Live Controls: Mic Mute + Hang Up */}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMicMuted((prev) => !prev)}
                    disabled={voiceState === 'connecting'}
                    title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    aria-label={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors disabled:opacity-45 sm:h-9 sm:w-9 ${
                      micMuted
                        ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#B45309] dark:border-[#FBBF24] dark:bg-[#451A03]/60 dark:text-[#FCD34D]'
                        : 'border-[#E5E7EB] bg-white text-[#111827] hover:border-[#0068B5] hover:text-[#0068B5] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]'
                    }`}
                  >
                    {micMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={stopVoiceSession}
                    title="End Voice Conversation"
                    aria-label="End Voice Conversation"
                    className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-[#DC2626] px-3.5 text-xs font-bold text-white transition-colors hover:bg-[#B91C1C] sm:h-9 sm:px-3"
                  >
                    <PhoneOff className="h-3.5 w-3.5" />
                    <span>End</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex shrink-0 items-end gap-2 border-t border-[#E5E7EB] bg-white px-3.5 py-3 safe-pb dark:border-[#1F2937] dark:bg-[#111827] sm:pb-3"
            >
              <button
                type="button"
                onClick={() => void startVoiceSession()}
                disabled={isSending}
                title="Start real-time voice conversation with NOVA"
                aria-label="Start real-time voice conversation with NOVA"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] text-[#0068B5] transition-colors hover:border-[#0068B5] hover:bg-[#EFF6FF] disabled:opacity-45 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#38BDF8] dark:hover:border-[#38BDF8] dark:hover:bg-[#1E293B] sm:h-[38px] sm:w-[38px]"
              >
                <Mic className="h-4 w-4" />
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isFastMode
                    ? 'Ask in plain English (e.g. battery, Tally, 4-year value)...'
                    : 'Ask about Core Ultra 5/7/9, battery, or budget...'
                }
                disabled={isSending}
                maxLength={800}
                className="max-h-24 min-h-[44px] flex-1 resize-none rounded-lg border border-[#E5E7EB] bg-[#FAF8F5] px-3 py-2.5 text-sm text-[#111827] placeholder-[#6B7280] focus:border-[#0068B5] focus:outline-none disabled:opacity-60 dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F3F4F6] dark:placeholder-[#64748B] dark:focus:border-[#38BDF8] sm:min-h-[38px] sm:py-2 sm:text-xs"
              />

              <button
                type="submit"
                disabled={isSending || !input.trim()}
                aria-label="Send message to NOVA"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#0068B5] text-white transition-colors hover:bg-[#005291] disabled:cursor-not-allowed disabled:opacity-45 sm:h-[38px] sm:w-[38px]"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
