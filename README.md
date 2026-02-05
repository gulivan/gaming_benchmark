# Gaming Benchmark

A benchmark comparing AI implementations of the same specification: a "Nerd Gaming" game hub with 6 playable browser games.

https://github.com/user-attachments/assets/demo.mp4

https://github.com/gulivan/gaming_benchmark/raw/main/videos/demo.mp4

## Specification

See [SPEC.md](./SPEC.md) for the full requirements. In summary:

- Vite + React + TypeScript app
- Home page with "Nerd Gaming" hero and game catalog
- 6 playable games: Tetris, Flappy Bird, 2048, Wordle, Minesweeper, Pinball
- Per-game high scores stored in localStorage
- Score submission modal on game over

## Tech Stack

Both implementations use:
- **Vite** - Build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **localStorage** - Score persistence

## Implementations

| Folder | AI Model | Lines of Code |
|--------|----------|---------------|
| `claude_implementation/` | Claude Opus 4.6 | 2,824 |
| `codex_implementation/` | OpenAI Codex 5.3 | 2,392 |

Claude wrote ~18% more code, primarily due to separating game logic into dedicated files (e.g., `tetrisLogic.ts`, `pinballPhysics.ts`), while Codex kept logic inside component files.

## Running

Each implementation is a standalone Vite project:

```bash
cd claude_implementation  # or codex_implementation
npm install
npm run dev
```

## Benchmark Results

### Cost & Rate Limits

| Model | Price Tier | Rate Limit Consumed |
|-------|------------|---------------------|
| Claude Opus 4.6 | $100/mo | 9% of 5h window |
| OpenAI Codex 5.3 | $20/mo | 3% of 5h window |


### Feature Comparison

| Feature | Claude | Codex | Winner |
|---------|--------|-------|--------|
| High Score System | Works correctly | Broken - displays form where player manually enters their score | Claude |

### Game-by-Game Results

| Game | Claude | Codex | Winner |
|------|--------|-------|--------|
| **Tetris** | Fully working | No pieces rendered | Claude |
| **Flappy Bird** | Better physics | Works | Claude (slight edge) |
| **2048** | Works, worse layout | Works | Codex (slight edge) |
| **Wordle** | Submit broken for subsequent words | Works | Codex |
| **Minesweeper** | Works | Works | Tie |
| **Pinball** | Broken | Broken, but playable (more like Arkanoid) | Codex |

### Final Score

| Model | Wins |
|-------|------|
| Claude | 2.5 |
| Codex | 2.5 |
| Tie | 1 |

**Verdict:** Tie overall, but Claude handles the core high-score feature correctly while Codex is more cost-efficient.
