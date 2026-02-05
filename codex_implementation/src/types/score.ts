import type { GameId } from './game';

export interface ScoreEntry {
  score: number;
  createdAt: string;
}

export type HighScoreSchema = Record<GameId, ScoreEntry[]>;
