import { lazy, type ComponentType } from 'react';
import type { GameProps } from '../types/game';

type LazyGameComponent = React.LazyExoticComponent<ComponentType<GameProps>>;

export const GAME_COMPONENTS: Record<string, LazyGameComponent> = {
  'tetris': lazy(() => import('../games/tetris/TetrisGame').then(m => ({ default: m.TetrisGame }))),
  'flappy-bird': lazy(() => import('../games/flappyBird/FlappyBirdGame').then(m => ({ default: m.FlappyBirdGame }))),
  '2048': lazy(() => import('../games/game2048/Game2048').then(m => ({ default: m.Game2048 }))),
  'wordle': lazy(() => import('../games/wordle/WordleGame').then(m => ({ default: m.WordleGame }))),
  'minesweeper': lazy(() => import('../games/minesweeper/MinesweeperGame').then(m => ({ default: m.MinesweeperGame }))),
  'pinball': lazy(() => import('../games/pinball/PinballGame').then(m => ({ default: m.PinballGame }))),
};
