export const GAME_IDS = [
  'tetris',
  'flappy-bird',
  '2048',
  'wordle',
  'minesweeper',
  'pinball',
] as const;

export type GameId = (typeof GAME_IDS)[number];

export interface GameMeta {
  id: GameId;
  title: string;
  description: string;
  route: string;
  thumbnail: string;
  status: 'playable';
  controls: string;
}
