import type { GameDefinition } from '../types/game';

export const GAMES: GameDefinition[] = [
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Stack and clear lines with falling tetrominoes. Classic puzzle action!',
    color: 'from-purple-500 to-indigo-600',
    emoji: '🧱',
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Tap to flap through pipes. Simple to learn, impossible to master.',
    color: 'from-green-400 to-emerald-600',
    emoji: '🐦',
  },
  {
    id: '2048',
    title: '2048',
    description: 'Slide and merge tiles to reach 2048. A math puzzle classic.',
    color: 'from-amber-400 to-orange-600',
    emoji: '🔢',
  },
  {
    id: 'wordle',
    title: 'Wordle',
    description: 'Guess the 5-letter word in 6 tries with color-coded hints.',
    color: 'from-emerald-500 to-teal-600',
    emoji: '📝',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Uncover cells without hitting mines. Use logic to survive!',
    color: 'from-slate-500 to-gray-700',
    emoji: '💣',
  },
  {
    id: 'pinball',
    title: 'Pinball',
    description: 'Launch the ball and rack up points with flippers and bumpers.',
    color: 'from-rose-500 to-pink-600',
    emoji: '🎯',
  },
];

export const GAME_MAP = new Map(GAMES.map((g) => [g.id, g]));
