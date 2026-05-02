# Yeah Nah Maybe

A voter advice tool for New Zealand's 2026 general election.

## Overview

Users answer 12 policy statements (Yeah/Mostly yeah/Dunno/Mostly nah/Nah), optionally flagging issues as important. Results show match percentages against 6 parties (Greens, Te Pāti Māori, Labour, National, NZ First, ACT), followed by an AI-powered chat with Tua the tuatara.

## Tech Stack

- **React** with hooks
- **Vite** for build tooling
- **Inline styles** (no Tailwind or CSS files)
- **Nunito** font via Google Fonts
- **Anthropic Claude API** (`claude-sonnet-4-20250514`) for AI chat
- Dark mode via `prefers-color-scheme`

## Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173/)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- `src/YeahNahMaybe.jsx` - Main single-file React component
- `src/main.jsx` - React entry point
- `index.html` - HTML template

## Key Design Decisions

- **Single component file** - The entire app lives in `YeahNahMaybe.jsx` for now
- **Party colors are fixed** - Do not adjust without asking
- **NZ First bar** - Black in light mode, grey (`#999999`) in dark mode
- **No bullet points** in Tua's responses - prose only
- **Touch-friendly** - All hover states guarded with `canHover`
- **Brand color** - `#808061` (tuatara olive)

## Future Work

- Move to proper React project with routing
- URL-based result sharing (encode answers/results in query string)
- Deploy to `yeahnahmaybe.nz`

## Environment Variables

The app calls the Anthropic API directly from the client. In production, you'll need to set up proper API key handling.

## About

Created by Thomas Le Bas - a Kiwi designer in London helping others engage with NZ politics.
