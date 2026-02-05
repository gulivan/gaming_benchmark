import type { ComponentType } from 'react';
import type { GameId } from '../types/game';
import { FlappyBirdGame } from './flappyBird/FlappyBirdGame';
import { Game2048 } from './game2048/Game2048';
import { MinesweeperGame } from './minesweeper/MinesweeperGame';
import { PinballGame } from './pinball/PinballGame';
import { TetrisGame } from './tetris/TetrisGame';
import type { ArcadeGameProps } from './types';
import { WordleGame } from './wordle/WordleGame';

export const GAME_COMPONENTS: Record<GameId, ComponentType<ArcadeGameProps>> = {
  tetris: TetrisGame,
  'flappy-bird': FlappyBirdGame,
  '2048': Game2048,
  wordle: WordleGame,
  minesweeper: MinesweeperGame,
  pinball: PinballGame,
};
