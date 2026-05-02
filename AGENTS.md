# Yeah Nah Maybe

NZ 2026 general election voter-advice quiz: 12 policy statements, match % vs six parties, then chat with Tua the tuatara (AI mascot).

## Stack

- **React 19** (JSX, no TypeScript), **Vite 7** — SPA, no routing library
- **Inline styles only** — no CSS files, no Tailwind, no CSS-in-JS
- **Anthropic Messages API** — called directly from the browser via `fetch` (no backend/proxy)
- **ESLint 9** flat config — only linter, no Prettier

## Commands

All commands must be run from `vite-project/`:

```
npm run dev       # dev server → http://localhost:5173
npm run build     # production build → vite-project/dist/
npm run preview   # preview production build
npm run lint      # eslint .
```

No test suite exists.

## Environment

Copy `vite-project/.env.example` → `vite-project/.env.local` and set:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

## Directory structure

```
yeahnahmaybe2026/
├── AGENTS.md
├── AGENTS.local.md        # machine-specific, gitignored
└── vite-project/
    ├── src/
    │   ├── main.jsx           # entry point
    │   └── YeahNahMaybe.jsx   # entire app (~634 lines)
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── eslint.config.js
```

## Architecture

- **Monolithic component:** the full quiz flow (welcome → questionnaire → results → chat → demographics) lives in a single `YeahNahMaybe.jsx` with local `useState`/`useRef` only. No global store.
- **Flow is stage-based:** a `stage` state variable drives which screen renders (not a router).
- **Top-level constants** (`QUESTIONS`, `PARTY_DATA`, `SYSTEM_PROMPT`) are defined at module scope above the component.
- **`window.storage`** is used for session analytics — this is a host-specific API (not standard `localStorage`) and silently no-ops on plain browsers. Do not replace with `localStorage`.
- Party colours are design invariants — treat them like brand assets.
- Calling Anthropic from the client is intentional for now; moving to a proxy is the planned hardening step.

## Never modify directly

| Path | Reason |
|------|--------|
| `vite-project/node_modules/` | managed by npm |
| `vite-project/package-lock.json` | generated; only update via `npm install` |
| `vite-project/dist/` | build output |

## Code style (not linter-enforced)

- Top-level config constants: `UPPER_SNAKE_CASE`
- Component file: `PascalCase.jsx`
- All styling via inline style objects — keep styles co-located with their element
- ESLint allows unused vars matching `^[A-Z_]` (intentional for top-level constants)
- Mixed quote style exists (double in component, single in `main.jsx`) — follow the file you're editing
