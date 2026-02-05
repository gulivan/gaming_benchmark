# Gaming Benchmark

A benchmark comparing AI implementations of the same specification: a "Nerd Gaming" game hub with 6 playable browser games.

## Specification

See [SPEC.md](./SPEC.md) for the full requirements. In summary:

- Vite + React + TypeScript app
- Home page with "Nerd Gaming" hero and game catalog
- 6 playable games: Tetris, Flappy Bird, 2048, Wordle, Minesweeper, Pinball
- Per-game high scores stored in localStorage
- Score submission modal on game over

## Implementations

| Folder | AI Model |
|--------|----------|
| `claude_implementation/` | Claude |
| `codex_implementation/` | Codex |

## Running

Each implementation is a standalone Vite project:

```bash
cd claude_implementation  # or codex_implementation
npm install
npm run dev
```

## Evaluation Criteria

- Spec compliance (all 6 games playable, score persistence works)
- Code quality and organization
- UI/UX polish
- Game mechanics accuracy
