# Jevtel — Silicon Quest: Core Ultra

> **GitHub About Description (copy into GitHub repo settings):**  
> Interactive dual-mode Intel Core Ultra AI PC retail kiosk & playable pixel-art RPG (*Silicon Quest*), featuring a 3-tap shopper matchmaker for Indian retail stores, 3D arcade cabinet, hardware builder, and Gemini-powered voice & text AI advisor (NOVA).

**Suggested GitHub Topics:** `intel-core-ultra` `gemini-api` `react` `typescript` `threejs` `tailwindcss` `express` `pixel-art-game` `retail-kiosk` `ai-assistant`

---

## Overview

**Jevtel** is a responsive, touch-ready retail showcase built for everyday walk-in shoppers and hardware enthusiasts across Indian retail floors (**Croma**, **Reliance Digital**, and **Vijay Sales**) on both smartphones and storefront kiosks.

It pairs two seamless experiences behind a single top-bar toggle (**Fast Mode | Pro Builder**) alongside **NOVA**, a mode-aware AI shopping & hardware advisor powered server-side by the Gemini API (text chat + real-time spoken voice).

---

## Key Features

### 1. Fast Mode *(Default Walk-In Shopper Flow)*
Designed for non-technical shoppers who want an instant, jargon-free laptop match in under 60 seconds:
- **01 · Your Day in 3 Taps:** Choose a primary daily life routine (+ optional secondary need), real-world priorities (AI tools, charger-free battery, 4+ year speed), and comfortable INR budget bracket (`Under ₹75,000` to `₹1,20,000+`).
- **02 · The 60-Second Store Showdown:** Interactive 4-moment stress test (*Out of Box*, *Monday Rush*, *Zero Wi-Fi on Train*, *18 Months Later*) comparing your matched Intel Core Ultra AI PC against a same-price generic lookalike with animated SVG telemetry meters (`Battery Left`, `Heat & Fan Noise`, `Privacy Shield`, `App Reliability`) in a compact slide-over card deck on mobile.
- **03 · Ask the Store Advisor & 30-Second Verification Check:** Swipeable store cards naming matched Intel Core Ultra Series 1 & Series 2 laptops across **Croma**, **Reliance Digital**, and **Vijay Sales**, a 4-year cost-per-year value breakdown, and an interactive 3-step demo-floor verification checklist.

### 2. Pro Builder & *Silicon Quest* Playable Arcade
Built for deeper hardware exploration and interactive storytelling:
- **Functional Cyberpunk Preloader (`IntroPreloader`):** Preloads landing artwork, UI assets, fonts, sprite atlases, 3D cabinet textures, and the CRT YouTube video showcase cleanly before reveal.
- **Interactive 3D Arcade Cabinet (`HeroArcade3DStage`):** Three.js arcade stage with touch/mouse drag-to-orbit, CRT video preview with mute/tap-for-sound control, and smooth transition into the full arcade experience.
- **Playable Action-RPG — *Silicon Quest* (`SiliconWorldEngine`):** Top-down pixel-art adventure inside Silicon City where **Byte** battles Lag Titan forces using **Slash**, **NPU Pulse**, **Arc XeSS Surge**, and **Dash**, inspects Intel hardware stations, tours Expo Park, and exports a personalized in-store match. Supports desktop keyboard/mouse and a portrait mobile handheld deck with a dynamic thumbstick and custom arc controls.
- **5-Slot AI PC Forge (`AiPcForgeSection`):** Interactive processor, graphics, memory, storage, and workload configuration with animated X-ray schematics, live performance meters, and curated retail product matches.

### 3. NOVA AI PC Advisor (Text + Real-Time Live Voice)
- Floating bottom-right drawer (85% height sheet on phones, compact panel on desktop) accessible across both modes.
- **Context-Aware Guidance:** Automatically adapts between plain-English store friend (*Fast Mode*) and Core Ultra tier advisor (*Pro Builder*).
- **Text & Real-Time Voice:** Uses `gemini-4-hydrogen` (`ThinkingLevel.LOW`) for chat (`POST /api/nova/chat`) and `gemini-3.8-live` over WebSockets (`WS /api/nova/live`) for bidirectional 16kHz/24kHz PCM audio streaming.

### 4. Mobile & Kiosk Safeguards
- Single-row compact responsive header (`Fast Mode | Pro Builder`, audio mute, light/dark toggle, and expanding mobile menu drawer).
- 3-minute idle kiosk auto-reset safeguard (`KIOSK_IDLE_TIMEOUT_MS`).

---

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion, Three.js, Lucide Icons
- **Backend:** Node.js, Express, `ws` (WebSocket live audio proxy), `dotenv`
- **AI SDK:** `@google/genai` (`gemini-4-hydrogen` text chat + `gemini-3.8-live` real-time voice)

---

## Project Structure

```text
├── server.ts                          # Express server + /api/nova/chat + WS /api/nova/live proxy
├── metadata.json                      # App manifest & SERVER_SIDE_GEMINI_API capability
├── .env.example                       # Server-side environment variable template
├── index.html                         # HTML shell & typography imports
├── public/assets/                     # Preloaded artwork, Tiny Swords sprites & custom UI assets
└── src/
    ├── App.tsx                        # Mode switching, game lifecycle & kiosk idle safeguard
    ├── components/
    │   ├── LandingHeader.tsx          # Compact top bar + Fast/Pro mode toggle + mobile drawer
    │   ├── IntroPreloader.tsx         # Cyberpunk preloader tracking sprite/3D/video readiness
    │   ├── FastModeExperience.tsx     # 3-tap selector, 60s Showdown & store advisor slide cards
    │   ├── HeroGateway.tsx            # Pro Builder hero stage wrapper
    │   ├── HeroArcade3DStage.tsx      # Interactive Three.js 3D arcade cabinet & CRT YouTube API
    │   ├── AiPcForgeSection.tsx       # Interactive 5-slot hardware configurator & benchmarks
    │   ├── RetailActionSection.tsx    # Floor match summary & demo verification tools
    │   ├── PreferenceProductsSection.tsx # Curated store catalog matching active build
    │   ├── ArcadeCabinetModal.tsx     # Responsive desktop cabinet / mobile portrait handheld deck
    │   ├── NovaAdvisorChat.tsx        # NOVA floating chat + WebSocket Live Voice console
    │   └── GameHud.tsx / DialogueModal.tsx / ExpoPcModal.tsx / VictorySummary.tsx
    └── game/
        ├── fastModeData.ts            # Verified Croma, Reliance Digital & Vijay Sales catalog
        ├── pcBuilderData.ts           # Core Ultra Forge configurations & workload telemetry
        ├── retailCatalogData.ts       # Pro catalog SKUs & tier mappings
        ├── intelHardwareData.ts       # Interactive Expo Park & hardware station specs
        ├── storyData.ts               # Silicon Quest dialogue tree & match logic
        ├── worldEngine.ts             # 2D HTML5 Canvas action-RPG engine
        └── assets.ts / audio.ts / haptics.ts
```

---

## Secure API Key Setup (For Developers & Hackathon Judges)

The Gemini API key is **strictly server-side**—it is never embedded in browser bundles, `vite.config.ts`, or client state, and visitors/judges never need to supply a key to chat with or talk to **NOVA**.

### Option A — Google AI Studio Preview & Shared App URL (Recommended)
1. Ensure **`GEMINI_API_KEY`** is attached in **Settings > Secrets** inside Google AI Studio.
2. Any judge or visitor opening the shared/deployed URL automatically uses your server-side key through `/api/nova/chat` and `/api/nova/live` without seeing or entering any credentials.

### Option B — Hosting From GitHub (Cloud Run, Render, Railway, VPS)
1. Set `GEMINI_API_KEY` as a **server environment variable / secret** in your hosting dashboard (`Settings` / `Secrets` / `Environment Variables`).
2. `server.ts` reads `process.env.GEMINI_API_KEY` (with fallback support for `API_KEY` or `GOOGLE_API_KEY` if your host names it that way).
3. Verify readiness cleanly via `GET /api/nova/status` (returns `{ "ready": true }` without exposing any secret).

### Option C — Local Development
1. Copy `.env.example` to `.env.local` (both `.env` and `.env.local` are excluded from git via `.gitignore`):
   ```bash
   cp .env.example .env.local
   ```
2. Add your Gemini API key inside `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. Never commit `.env` or `.env.local` to GitHub.

---

## Running Locally & Deploying

```bash
# Install dependencies
npm install

# Start development server (Express + Vite middleware on port 3000)
npm run dev

# Type-check & lint
npm run lint

# Build production frontend bundle
npm run build

# Start production server (serves dist/ + /api/nova/* on port 3000)
npm start
```
