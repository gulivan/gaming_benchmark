export interface ScoreEntry {
  playerName: string;
  score: number;
  date: string;
}

export type HighScoreStore = Record<string, ScoreEntry[]>;
