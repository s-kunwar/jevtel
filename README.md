# Jevtel — Silicon Quest: Core Ultra

> **Interactive Intel Core Ultra AI PC Retail Kiosk & Playable Pixel-Art RPG**
>
> A dual-mode retail experience combining personalized laptop discovery, interactive hardware exploration, a playable pixel-art adventure, and a Gemini-powered AI shopping advisor.

**GitHub About Description**

Interactive dual-mode Intel Core Ultra AI PC retail kiosk featuring a 3-tap shopper matchmaker, 3D arcade cabinet, playable pixel-art RPG (Silicon Quest), hardware builder, and Gemini-powered voice and text AI advisor (NOVA).

**Suggested GitHub Topics**

`intel-core-ultra` `gemini-api` `react` `typescript` `threejs` `tailwindcss` `express` `pixel-art-game` `retail-kiosk` `ai-assistant`

---

## Overview

**Jevtel** is a responsive, touch-ready retail showcase designed for everyday shoppers and hardware enthusiasts across Indian retail environments, including **Croma, Reliance Digital, and Vijay Sales**.

It brings together two connected experiences through a single top-bar toggle:

- **Fast Mode:** A simplified laptop discovery experience for everyday shoppers.
- **Pro Builder:** An interactive hardware exploration experience featuring a 3D arcade cabinet and playable RPG.

Alongside both experiences is **NOVA**, a mode-aware AI shopping and hardware advisor powered by the Gemini API, supporting text-based conversations and real-time spoken interaction.

---

## Key Features

### 1. Fast Mode — Default Walk-In Shopper Flow

Designed for non-technical shoppers who want an instant, jargon-free laptop recommendation in under 60 seconds.

#### 01 · Your Day in 3 Taps

Users select:

- Their primary daily routine, with an optional secondary need.
- Real-world priorities such as AI tools, charger-free battery life, and performance over four or more years.
- A comfortable INR budget bracket, ranging from `Under ₹75,000` to `₹1,20,000+`.

#### 02 · The 60-Second Store Showdown

An interactive four-moment stress test compares the matched Intel Core Ultra AI PC against a same-price generic alternative.

The four scenarios are:

1. **Out of Box**
2. **Monday Rush**
3. **Zero Wi-Fi on Train**
4. **18 Months Later**

Animated SVG telemetry meters display:

- Battery Left
- Heat & Fan Noise
- Privacy Shield
- App Reliability

Results are presented through a compact slide-over card deck optimized for mobile screens.

#### 03 · Ask the Store Advisor & 30-Second Verification Check

Features include:

- Swipeable store cards with matched Intel Core Ultra Series 1 and Series 2 laptops.
- Product listings across Croma, Reliance Digital, and Vijay Sales.
- Four-year cost-per-year value breakdown.
- Interactive three-step demo-floor verification checklist.

### 2. Pro Builder & Silicon Quest Playable Arcade

Built for deeper hardware exploration and interactive storytelling.

#### Cyberpunk Preloader — `IntroPreloader`

Preloads the following assets before revealing the experience:

- Landing artwork and UI assets.
- Fonts and sprite atlases.
- 3D cabinet textures.
- CRT YouTube video showcase.

#### Interactive 3D Arcade Cabinet — `HeroArcade3DStage`

A Three.js-powered arcade stage featuring:

- Mouse and touch drag-to-orbit interaction.
- CRT video preview.
- Mute and tap-for-sound controls.
- Smooth transition into the full arcade experience.

#### Silicon Quest — Playable Action RPG

A top-down pixel-art adventure set inside **Silicon City**.

Players control **Byte**, who battles Lag Titan forces using four abilities:

- **Slash**
- **NPU Pulse**
- **Arc XeSS Surge**
- **Dash**

Players can also:

- Explore Silicon City and Expo Park.
- Inspect interactive Intel hardware stations.
- Export a personalized in-store laptop match.

**Supported controls:**

- Desktop: Keyboard and mouse.
- Mobile: Portrait-oriented handheld deck with dynamic thumbstick and custom arc controls.

#### 5-Slot AI PC Forge — `AiPcForgeSection`

An interactive hardware configurator featuring five slots:

1. Processor
2. Graphics
3. Memory
4. Storage
5. Workload

Features include animated X-ray schematics, live performance meters, and curated retail product matches.

### 3. NOVA — AI PC Advisor

NOVA is a floating AI advisor available across both Fast Mode and Pro Builder.

**Interface**

- Floating bottom-right drawer.
- Approximately 85% height sheet on phones.
- Compact panel on desktop.

**Context-Aware Guidance**

NOVA adapts its responses based on the active mode:

- **Fast Mode:** Plain-English shopping guidance.
- **Pro Builder:** Core Ultra hardware and configuration guidance.

**Text Chat**

Uses `gemini-4-hydrogen` with `ThinkingLevel.LOW`.

API endpoint:

```http
POST /api/nova/chat
```

**Real-Time Live Voice**

Uses `gemini-3.8-live` over WebSockets for bidirectional 16kHz/24kHz PCM audio streaming.

WebSocket endpoint:

```http
WS /api/nova/live
```

### 4. Mobile & Kiosk Safeguards

The interface includes:

- Compact single-row responsive header.
- Fast Mode and Pro Builder toggle.
- Audio mute control.
- Light/dark theme toggle.
- Expanding mobile menu drawer.
- Three-minute idle kiosk auto-reset safeguard using `KIOSK_IDLE_TIMEOUT_MS`.

---

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| Animation | Motion |
| 3D | Three.js |
| Icons | Lucide Icons |
| Backend | Node.js, Express |
| WebSocket | `ws` |
| Environment Configuration | `dotenv` |
| AI SDK | `@google/genai` |
| Text AI | `gemini-4-hydrogen` |
| Real-Time Voice AI | `gemini-3.8-live` |

---

## Project Structure

```text
├── server.ts
│   # Express server + /api/nova/chat + WS /api/nova/live proxy
├── metadata.json
│   # App manifest & SERVER_SIDE_GEMINI_API capability
├── .env.example
│   # Server-side environment variable template
├── index.html
│   # HTML shell & typography imports
├── public/assets/
│   # Preloaded artwork, Tiny Swords sprites & custom UI assets
└── src/
    ├── App.tsx
    │   # Mode switching, game lifecycle & kiosk idle safeguard
    ├── components/
    │   ├── LandingHeader.tsx
    │   ├── IntroPreloader.tsx
    │   ├── FastModeExperience.tsx
    │   ├── HeroGateway.tsx
    │   ├── HeroArcade3DStage.tsx
    │   ├── AiPcForgeSection.tsx
    │   ├── RetailActionSection.tsx
    │   ├── PreferenceProductsSection.tsx
    │   ├── ArcadeCabinetModal.tsx
    │   ├── NovaAdvisorChat.tsx
    │   └── GameHud.tsx
    │       ├── DialogueModal.tsx
    │       ├── ExpoPcModal.tsx
    │       └── VictorySummary.tsx
    └── game/
        ├── fastModeData.ts
        ├── pcBuilderData.ts
        ├── retailCatalogData.ts
        ├── intelHardwareData.ts
        ├── storyData.ts
        ├── worldEngine.ts
        └── assets.ts / audio.ts / haptics.ts
```

---

## Secure API Key Setup

The Gemini API key is strictly server-side. It is never embedded in browser bundles, `vite.config.ts`, or client state.

Visitors and judges accessing a shared or deployed application do not need to provide their own API key when the server-side environment is configured correctly.

### Option A — Google AI Studio Preview & Shared App URL

1. Ensure `GEMINI_API_KEY` is attached under **Settings → Secrets** inside Google AI Studio.
2. Open the shared or deployed application URL.
3. The application uses its server-side key through `/api/nova/chat` and `/api/nova/live`.

### Option B — Hosting From GitHub

For Cloud Run, Render, Railway, or a VPS:

1. Set `GEMINI_API_KEY` as a server environment variable or secret in the hosting dashboard.
2. `server.ts` reads `process.env.GEMINI_API_KEY`.
3. Fallback support is available for `API_KEY` or `GOOGLE_API_KEY`.
4. Verify readiness using:

```http
GET /api/nova/status
```

Expected response:

```json
{
  "ready": true
}
```

The status endpoint returns readiness without exposing the API key.

### Option C — Local Development

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Both `.env` and `.env.local` are excluded from Git through `.gitignore`.

**Never commit API keys or environment secrets to GitHub.**

---

## Running Locally & Deploying

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Starts the Express server with Vite middleware on port `3000`.

### Type-Check & Lint

```bash
npm run lint
```

### Build Production Frontend

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

The production server serves `dist/` and handles `/api/nova/*` on port `3000`.

---

## Jevtel — Silicon Quest: Core Ultra

**Explore the experience through two modes:**

- **Fast Mode** — Discover an Intel Core Ultra laptop through your everyday needs.
- **Pro Builder** — Explore hardware, configure a PC, and enter Silicon Quest.

**Powered by React, Three.js, Node.js, Express, and Gemini.**
