# Modelia — AI Studio Lite

A small React + TypeScript web app (Vite + TailwindCSS) that simulates a simplified AI studio.
It fulfills the required features: image upload + preview with client-side downscale, prompt + style,
live summary, mocked generation API with 20% failure and exponential backoff + abort, history in
localStorage (last 5), and solid accessibility basics. Bonus items included: unit tests (Vitest +
Testing Library), Playwright e2e smoke test, PWA (manifest + service worker), error boundaries (implicit via Abort handling and empty states), and performance optimizations (client downscale, small component tree).

## Quickstart

```bash
# 1) Unzip, then open a terminal in the project folder
npm install
npm run dev
# App runs at http://localhost:5173
```

### Build & Preview

```bash
npm run build
npm run preview
```

### Lint, Format, Test

```bash
npm run lint
npm run format
npm test
npm run e2e   # requires a second terminal to run 'npm run dev' OR uses webServer config
```

## How it maps to the assignment

- **Upload & Preview** — Accepts PNG/JPG (≤10MB). If file is too large or dimensions exceed 1920px, it is downscaled client‑side before sending (canvas → JPEG).
- **Prompt & Style** — Text input + dropdown with 3 styles (Editorial, Streetwear, Vintage) and a live summary card.
- **Generate (Mock API)** — `generateWithRetries` simulates 1–2s latency, returns an item or a 20% `"Model overloaded"` error. It retries with exponential backoff (500ms, 1000ms) up to 3 attempts. Abort is supported via `AbortController`.
- **History** — Last 5 generations are saved in `localStorage`. Clicking an item restores the preview.
- **Accessibility** — Keyboard navigable, labeled inputs, `aria-live` for status, visible `:focus-visible` rings.

**Tech:** React + TypeScript (strict), Vite, TailwindCSS, ESLint + Prettier.  
**Bonus:** Vitest + RTL, Playwright e2e, PWA manifest + service worker, empty states.

## Design Notes

- Client image downscale ensures fast previews and small payloads.
- State lives in a single `App` component for simplicity; easily refactorable to context or Zustand.
- The mocked API is isolated in `src/lib/mockApi.ts` for testing and replacement.
- History logic is encapsulated (`src/lib/history.ts`).
- PWA is intentionally minimal and safe; it caches core shell and progressively caches fetched assets.

## Accessibility Notes

- Semantic labels (`label` + `htmlFor`) for inputs.
- Clear focus states via Tailwind and `:focus-visible`.
- Live regions (`aria-live`) for async status and errors.

## Required Node

Node.js 18+ recommended.

## Folder Structure

```
modelia-ai-studio-lite/
├─ src/
│  ├─ lib/           # image utils, mock API, history
│  ├─ ui/            # App component
│  ├─ styles.css     # Tailwind entry
│  └─ main.tsx
├─ public/           # PWA files (sw.js, manifest), favicon
├─ tests/            # Vitest + RTL
├─ e2e/              # Playwright smoke test
├─ package.json
├─ tailwind.config.js
├─ vite.config.ts
└─ README.md
```

## What to send

- Create a public GitHub repo and push this project.
- Open at least **2 Pull Requests** (e.g., PR1: feature core UI; PR2: tests + PWA).
- Include this `README.md` and `AI_USAGE.md` in the repo root.
- (Optional) Add `evidence/` screenshots and CI badges.

_Generated on 2025-08-26_
