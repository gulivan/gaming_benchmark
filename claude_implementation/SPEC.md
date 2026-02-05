# Game Hub Vite App Spec (MVP)

## 1) Product Overview

Build a simple Vite app that acts as a game hub with:
- A main page with a hero section themed as **"Nerd Gaming"**
- A game catalog
- Dedicated playable pages for each game
- Per-game high scores stored in browser memory

## 2) Scope

### In Scope (MVP)
- Vite-based single-page app (recommended: React + TypeScript)
- Home page (`/`) with:
  - Hero section: "Nerd Gaming"
  - Catalog cards for six games
- Dedicated route per game:
  - `/games/tetris`
  - `/games/flappy-bird`
  - `/games/2048`
  - `/games/wordle`
  - `/games/minesweeper`
  - `/games/pinball`
- Each game is playable on its own page
- Game-over flow asks user to submit a score
- High scores are saved and shown per game using browser storage

### Out of Scope (for now)
- Backend or cloud sync
- Authentication/accounts
- Multiplayer
- Cross-device score sync

## 3) Core User Stories

1. As a player, I can open the home page and see a clear game hub with a "Nerd Gaming" hero.
2. As a player, I can browse the catalog and open a dedicated page for any listed game.
3. As a player, I can play each game in the browser.
4. As a player, when a game ends, I am prompted to enter/confirm my score.
5. As a player, I can see persisted high scores for each game after refresh.

## 4) Information Architecture

### Routes
- `/` Home page with hero + catalog
- `/games/:gameId` Dedicated game page
- Optional fallback: `*` -> Not Found page with link back to `/`

### Game Catalog (initial data)
- `tetris`
- `flappy-bird`
- `2048`
- `wordle`
- `minesweeper`
- `pinball`

Catalog is data-driven from a single source (e.g., `games.ts`) with:
- `id`
- `title`
- `description`
- `route`
- `thumbnail` (placeholder allowed)
- `status` (`playable`)

## 5) Game Page Requirements

Each game page must include:
- Game title
- Play area (canvas/div-based implementation)
- Basic controls/help text
- Start/restart controls
- Current score display (if game supports scoring)
- High score panel for that game

### End-of-Game Score Flow
- Trigger when game ends
- Show modal/dialog:
  - Message: game over
  - Numeric score input (prefilled with computed score if available)
  - Save action
- On save:
  - Validate score is a non-negative integer
  - Write to per-game high scores
  - Re-render leaderboard immediately

## 6) High Score Storage (Browser Memory)

Use `localStorage` (browser-side persistence only).

### Storage Key
- `gameHub.highScores.v1`

### Data Shape
```json
{
  "tetris": [
    { "score": 12000, "createdAt": "2026-02-05T12:00:00.000Z" }
  ],
  "flappy-bird": [],
  "2048": [],
  "wordle": [],
  "minesweeper": [],
  "pinball": []
}
```

### Storage Rules
- Keep scores per game
- Sort descending by score
- Keep top 10 entries per game
- Gracefully recover if storage is missing/corrupted (reset to empty schema)

## 7) Suggested Technical Structure

```text
src/
  app/
    router.tsx
  pages/
    HomePage.tsx
    GamePage.tsx
  games/
    tetris/
    flappyBird/
    game2048/
    wordle/
    minesweeper/
    pinball/
  components/
    Hero.tsx
    GameCatalog.tsx
    GameCard.tsx
    HighScoreList.tsx
    SubmitScoreDialog.tsx
  data/
    games.ts
  services/
    highScores.ts
  types/
    game.ts
    score.ts
```

## 8) Non-Functional Requirements

- Responsive layout (mobile + desktop)
- Fast initial load for hub page
- No backend dependencies
- Basic accessibility:
  - Keyboard navigable controls
  - Visible focus states
  - Dialog uses proper focus trap/ARIA labels

## 9) Acceptance Criteria

1. Home page shows hero text "Nerd Gaming" and all 6 game cards.
2. Each card links to a dedicated route for that game.
3. Each game route renders a playable version of that game.
4. Ending a game opens a score submission dialog.
5. Saved score appears in that game's leaderboard.
6. Scores persist after browser refresh via `localStorage`.
7. Leaderboard is sorted descending and capped to top 10.
8. App works with no backend services.

## 10) Delivery Plan (recommended)

1. Build app shell, routing, and home/catalog UI.
2. Implement shared high-score service (`localStorage` + validation/sorting).
3. Add generic game page contract (`onGameOver(score)` callback).
4. Implement six playable games incrementally behind a common interface.
5. Run manual QA for score submission and persistence on all game pages.
