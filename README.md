# Yeah Nah Maybe

A voter advice tool for New Zealand's 2026 general election.

**Live site:** https://thomaslebas.github.io/yeahnahmaybe2026/

> **Work in progress.** Party position scores, questions, and Tua's behaviour are still being refined ahead of the 2026 election. Treat results as a starting point, not a definitive ranking. The source is public so you can see exactly how it works and challenge anything that looks off.

## What it does

Users answer 12 policy statements (Yeah / Mostly yeah / Dunno / Mostly nah / Nah), optionally flagging issues as important. Results show match percentages against six parties (Greens, Te Pāti Māori, Labour, National, NZ First, ACT), followed by an AI-powered chat with Tua the tuatara.

## Transparency

This repo is public so anyone can audit how the tool works:

- **Questions:** `QUESTIONS` in [`vite-project/src/YeahNahMaybe.jsx`](vite-project/src/YeahNahMaybe.jsx)
- **Party positions:** `PARTY_DATA` (scores 1–5 per statement per party)
- **Scoring algorithm:** `calcResults()` (weighted distance from user answers to party scores; important flags double the weight)
- **Tua's behaviour:** `SYSTEM_PROMPT` (rules for the AI assistant)

The tool offers voter advice. It does not endorse any party.

Party scores in `PARTY_DATA` are editorial judgments based on publicly stated positions. They will be updated as policies shift. If something looks wrong, open an issue or submit a PR.

## Tech stack

- React 19 + Vite 7: single-page app, inline styles only
- GitHub Pages: static hosting
- Cloudflare Worker: proxies chat requests to Anthropic; API key is stored as a Cloudflare secret, not in this repo

## Local development

```bash
cd vite-project
npm install
cp .env.example .env.local   # set VITE_CHAT_API_URL to your worker URL
npm run dev                  # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # preview production build
npm run lint     # eslint
```

## Deploying the chat proxy

The worker lives in [`worker/`](worker/). One-time setup:

```bash
cd worker
npx wrangler deploy
npx wrangler secret put ANTHROPIC_API_KEY
```

Then set the `VITE_CHAT_API_URL` repository variable in GitHub (Settings → Secrets and variables → Actions → Variables) to your worker URL, e.g. `https://yeahnahmaybe-chat.<subdomain>.workers.dev`.

The frontend deploys automatically via GitHub Actions on push to `main`. Enable **Settings → Pages → Source: GitHub Actions** if not already set.

## About

Created by Thomas Le Bas, a Kiwi designer in London helping others engage with NZ politics.
