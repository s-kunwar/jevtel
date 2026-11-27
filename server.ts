import 'dotenv/config';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Request, type Response } from 'express';
import { WebSocketServer, type WebSocket } from 'ws';
import {
  GoogleGenAI,
  Modality,
  ThinkingLevel,
  type Content,
  type LiveServerMessage,
} from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface KioskContextInput {
  hasCompletedQuest?: boolean;
  matchSource?: 'builder' | 'quest';
  processorLabel?: string;
  graphicsLabel?: string;
  memoryLabel?: string;
  storageLabel?: string;
  scenarioLabel?: string;
  matchedTierName?: string;
}

const BASE_NOVA_SYSTEM_INSTRUCTION = `You are NOVA, an interactive Retail PC Advisor built into an arcade kiosk experience for walk-in Gen-Z shoppers at Reliance Digital, Croma, and Vijay Sales.

Your goal:
Help shoppers who just played (or are exploring) the Intel AI PC arcade challenge understand why an Intel Core Ultra AI PC is a smarter long-term buy than a cheaper, non-AI "aesthetic" laptop—and guide them to the right tier for their needs.

Tone & Formatting:
- Gen-Z friendly, casual, confident, and zero tech jargon. Explain concepts simply (e.g., NPU = a dedicated AI engine that saves battery and keeps data private on your device).
- Keep responses short and easy to scan: ALWAYS stay strictly under 90 words, using 2–3 crisp bullet points or short lines.
- Never invent specific laptop SKU model numbers or live store prices.

Knowledge & Recommendation Rules:
1. Before recommending a PC tier, ask 1–2 quick clarifying questions if you don't already know BOTH their primary use case (College/Work, Content Creation, Gaming, or Everyday Multitasking) and general budget comfort.
2. When you have enough info to recommend, recommend by Intel Core Ultra tier + trusted OEM brands available in-store (HP, Dell, Lenovo, ASUS, Acer):
   - Intel Core Ultra 5: Best for students, everyday multitasking, long battery life, and smooth on-device AI tools.
   - Intel Core Ultra 7: Best for creators, coding, heavy multitasking, and light-to-mid gaming with faster NPU/GPU headroom.
   - Intel Core Ultra 9: Best for pro 3D/video editing, AAA gaming, and maximum future-proof performance.
3. Compare Intel AI PCs vs. budget non-AI PCs objectively without bashing any competing chip or laptop brand by name: highlight on-device AI app support, offline privacy (data stays on the laptop), battery efficiency (NPU offloads AI tasks from CPU/GPU), and multi-year performance vs. short-term flashy looks.
4. End every concrete recommendation with a clear "Show to Store Rep" next step (e.g., "Show to Store Rep: Ask an advisor here at Reliance Digital, Croma, or Vijay Sales to test an Intel Core Ultra 5/7 from HP, Lenovo, ASUS, Dell, or Acer in person!").

Strict Guardrails:
- Stay strictly on PCs, Intel AI PC features, laptop buying advice, and the arcade game. If asked about anything unrelated (homework, politics, random trivia), politely steer back to helping them pick the right laptop.
- Never bash competing chip or laptop brands by name; win purely on tangible AI PC benefits.`;

function buildSystemInstruction(context?: KioskContextInput): string {
  if (!context) return BASE_NOVA_SYSTEM_INSTRUCTION;

  const clean = (val: unknown, max = 80): string =>
    typeof val === 'string' ? val.replace(/[\r\n]+/g, ' ').trim().slice(0, max) : '';

  const notes: string[] = [];
  if (context.hasCompletedQuest) {
    notes.push('Shopper already finished the Silicon Quest arcade challenge.');
  }
  const tier = clean(context.matchedTierName);
  if (tier) {
    notes.push(`Kiosk match currently points toward: ${tier} (source: ${context.matchSource === 'quest' ? 'arcade quest' : 'PC builder'}).`);
  }
  const specs = [
    clean(context.processorLabel),
    clean(context.graphicsLabel),
    clean(context.memoryLabel),
    clean(context.storageLabel),
  ].filter(Boolean);
  if (specs.length > 0) {
    notes.push(`Shopper's current builder preview: ${specs.join(' · ')}.`);
  }
  const scenario = clean(context.scenarioLabel);
  if (scenario) {
    notes.push(`Selected workload preview: ${scenario}.`);
  }

  if (notes.length === 0) return BASE_NOVA_SYSTEM_INSTRUCTION;

  return `${BASE_NOVA_SYSTEM_INSTRUCTION}

Live Kiosk Context (reference lightly only if helpful; still confirm use case & budget comfort if unclear):
- ${notes.join('\n- ')}`;
}

function buildLiveSystemInstruction(
  context?: KioskContextInput,
  recentHistory?: ChatMessageInput[]
): string {
  const base = buildSystemInstruction(context);
  const voiceRules = `

Live Voice Conversation Rules:
- You are now in a real-time spoken conversation inside the retail kiosk NOVA window.
- Keep each spoken turn crisp, warm, and conversational (around 25 to 55 words, 2 to 3 short sentences) so shoppers can listen easily on the store floor.
- Do not read out markdown symbols like asterisks or bullet characters; speak naturally.
- Greet the shopper briefly ONLY if this is the start of the conversation; otherwise respond directly to what they say.`;

  if (!Array.isArray(recentHistory) || recentHistory.length === 0) {
    return `${base}${voiceRules}`;
  }

  const cleanHistory = recentHistory
    .slice(-8)
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => `${m.role === 'user' ? 'Shopper' : 'NOVA'}: ${m.text.replace(/[\r\n]+/g, ' ').trim().slice(0, 280)}`);

  if (cleanHistory.length === 0) {
    return `${base}${voiceRules}`;
  }

  return `${base}${voiceRules}

Recent Chat History Before Switching to Voice:
${cleanHistory.join('\n')}`;
}

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error('Gemini API key is missing. Please add GEMINI_API_KEY in Settings > Secrets.'),
      { statusCode: 500 }
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown): { status: number; message: string } {
  const rawMsg = err instanceof Error ? err.message : String(err);
  const statusMatch = rawMsg.match(/\b(400|401|403|404|429|500|503)\b/);
  const explicitStatus =
    typeof err === 'object' && err !== null && 'statusCode' in err
      ? Number((err as { statusCode?: number }).statusCode)
      : statusMatch
        ? Number(statusMatch[1])
        : 500;

  if (rawMsg.includes('API_KEY_INVALID') || rawMsg.includes('PERMISSION_DENIED') || explicitStatus === 403 || explicitStatus === 401) {
    return {
      status: explicitStatus,
      message: 'Gemini API key was rejected or lacks permission. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (rawMsg.includes('RESOURCE_EXHAUSTED') || explicitStatus === 429) {
    return {
      status: 429,
      message: 'NOVA is handling high kiosk traffic right now. Please wait a few seconds and try again.',
    };
  }
  if (rawMsg.includes('NOT_FOUND') || explicitStatus === 404) {
    return {
      status: 404,
      message: 'Configured Gemini model was not found. Please check model availability.',
    };
  }
  if (rawMsg.includes('Gemini API key is missing')) {
    return { status: 500, message: rawMsg };
  }
  return {
    status: explicitStatus >= 400 && explicitStatus < 600 ? explicitStatus : 500,
    message: 'NOVA hit a temporary connection hiccup. Please try sending your message again.',
  };
}

async function sendWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes('503') || msg.includes('500') || msg.includes('UNAVAILABLE') || msg.includes('ECONNRESET');
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 400 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/nova/chat', async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        messages?: unknown;
        context?: KioskContextInput;
      };

      if (!Array.isArray(body?.messages) || body.messages.length === 0) {
        res.status(400).json({ error: 'Please send at least one message.' });
        return;
      }

      const sanitized: ChatMessageInput[] = body.messages
        .slice(-24)
        .filter(
          (m): m is ChatMessageInput =>
            typeof m === 'object' &&
            m !== null &&
            ((m as ChatMessageInput).role === 'user' || (m as ChatMessageInput).role === 'model') &&
            typeof (m as ChatMessageInput).text === 'string' &&
            (m as ChatMessageInput).text.trim().length > 0
        )
        .map((m) => ({
          role: m.role,
          text: m.text.trim().slice(0, 1200),
        }));

      const latest = sanitized[sanitized.length - 1];
      if (!latest || latest.role !== 'user') {
        res.status(400).json({ error: 'The latest message must be from the shopper.' });
        return;
      }

      // Build prior multi-turn history; Gemini chat history must start with a user turn if non-empty
      let prior = sanitized.slice(0, -1);
      const firstUserIdx = prior.findIndex((m) => m.role === 'user');
      prior = firstUserIdx >= 0 ? prior.slice(firstUserIdx) : [];

      const history: Content[] = prior.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const ai = getAiClient();
      const systemInstruction = buildSystemInstruction(body.context);

      const response = await sendWithRetry(async () => {
        const chat = ai.chats.create({
          model: 'gemini-4-hydrogen',
          history,
          config: {
            systemInstruction,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
        return chat.sendMessage({ message: latest.text });
      });

      const replyText = (response.text ?? '').trim();
      if (!replyText) {
        res.status(502).json({ error: 'NOVA returned an empty response. Please try again.' });
        return;
      }

      res.json({ reply: replyText });
    } catch (err) {
      const formatted = formatGeminiError(err);
      console.error('[NOVA /api/nova/chat]', err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const host = request.headers.host || `localhost:${PORT}`;
      const url = new URL(request.url || '/', `http://${host}`);
      if (url.pathname === '/api/nova/live') {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit('connection', ws, request);
        });
      }
    } catch {
      socket.destroy();
    }
  });

  wss.on('connection', (clientWs: WebSocket) => {
    let closed = false;
    let sessionStarted = false;
    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    const pendingAudioChunks: string[] = [];

    const safeSend = (payload: Record<string, unknown>) => {
      if (!closed && clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    const startLiveSession = async (
      context?: KioskContextInput,
      recentHistory?: ChatMessageInput[]
    ) => {
      if (sessionStarted || closed) return;
      sessionStarted = true;

      try {
        const ai = getAiClient();
        const session = await ai.live.connect({
          model: 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' },
              },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: buildLiveSystemInstruction(context, recentHistory),
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              const content = message.serverContent;
              if (content?.inputTranscription?.text) {
                safeSend({
                  type: 'inputTranscript',
                  text: content.inputTranscription.text,
                });
              }
              if (content?.outputTranscription?.text) {
                safeSend({
                  type: 'outputTranscript',
                  text: content.outputTranscription.text,
                });
              }
              for (const part of content?.modelTurn?.parts ?? []) {
                if (part.inlineData?.data) {
                  safeSend({
                    type: 'audio',
                    data: part.inlineData.data,
                  });
                }
              }
              if (content?.interrupted) {
                safeSend({ type: 'interrupted' });
              }
              if (content?.turnComplete) {
                safeSend({ type: 'turnComplete' });
              }
            },
            onerror: (errEvent) => {
              console.error('[NOVA Live WS error]', errEvent);
              const formatted = formatGeminiError(errEvent);
              safeSend({ type: 'error', message: formatted.message });
            },
            onclose: () => {
              if (!closed) {
                safeSend({ type: 'closed' });
              }
            },
          },
        });

        if (closed) {
          session.close();
          return;
        }

        liveSession = session;
        safeSend({ type: 'ready' });

        while (pendingAudioChunks.length > 0 && !closed) {
          const chunk = pendingAudioChunks.shift();
          if (chunk) {
            session.sendRealtimeInput({
              audio: { data: chunk, mimeType: 'audio/pcm;rate=16000' },
            });
          }
        }
      } catch (err) {
        const formatted = formatGeminiError(err);
        console.error('[NOVA Live connect failed]', err);
        safeSend({ type: 'error', message: formatted.message });
        clientWs.close();
      }
    };

    clientWs.on('message', (raw) => {
      if (closed) return;
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          data?: string;
          text?: string;
          context?: KioskContextInput;
          recentHistory?: ChatMessageInput[];
        };

        if (msg.type === 'start') {
          void startLiveSession(msg.context, msg.recentHistory);
          return;
        }

        if (msg.type === 'audio' && typeof msg.data === 'string' && msg.data.length > 0) {
          if (!sessionStarted) {
            void startLiveSession();
          }
          if (liveSession) {
            liveSession.sendRealtimeInput({
              audio: { data: msg.data, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (pendingAudioChunks.length < 32) {
            pendingAudioChunks.push(msg.data);
          }
          return;
        }

        if (msg.type === 'text' && typeof msg.text === 'string' && msg.text.trim()) {
          liveSession?.sendRealtimeInput({
            text: msg.text.trim().slice(0, 800),
          });
        }
      } catch (err) {
        console.error('[NOVA Live client message parse error]', err);
      }
    });

    clientWs.on('close', () => {
      closed = true;
      pendingAudioChunks.length = 0;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // ignore close error
        }
        liveSession = null;
      }
    });

    clientWs.on('error', () => {
      closed = true;
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // ignore close error
        }
        liveSession = null;
      }
    });
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

void startServer();
