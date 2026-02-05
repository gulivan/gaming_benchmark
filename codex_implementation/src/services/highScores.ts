import { GAME_IDS, type GameId } from '../types/game';
import type { HighScoreSchema, ScoreEntry } from '../types/score';

export const HIGH_SCORE_STORAGE_KEY = 'gameHub.highScores.v1';

const createEmptySchema = (): HighScoreSchema => ({
  tetris: [],
  'flappy-bird': [],
  '2048': [],
  wordle: [],
  minesweeper: [],
  pinball: [],
});

const isValidEntry = (value: unknown): value is ScoreEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ScoreEntry>;
  return (
    typeof candidate.score === 'number' &&
    Number.isInteger(candidate.score) &&
    candidate.score >= 0 &&
    typeof candidate.createdAt === 'string'
  );
};

const normalizeEntries = (entries: ScoreEntry[]): ScoreEntry[] => {
  return [...entries]
    .filter((entry) => Number.isInteger(entry.score) && entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
};

const parseSchema = (raw: unknown): HighScoreSchema | null => {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const parsed = createEmptySchema();

  for (const gameId of GAME_IDS) {
    const value = candidate[gameId];
    if (!Array.isArray(value)) {
      return null;
    }

    if (!value.every(isValidEntry)) {
      return null;
    }

    parsed[gameId] = normalizeEntries(value);
  }

  return parsed;
};

const resetToEmptySchema = (): HighScoreSchema => {
  const empty = createEmptySchema();
  try {
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(empty));
  } catch {
    // Ignore storage write failures and still return a safe in-memory schema.
  }
  return empty;
};

export const readHighScores = (): HighScoreSchema => {
  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (!raw) {
      return resetToEmptySchema();
    }

    const parsedJson: unknown = JSON.parse(raw);
    const parsedSchema = parseSchema(parsedJson);

    if (!parsedSchema) {
      return resetToEmptySchema();
    }

    return parsedSchema;
  } catch {
    return resetToEmptySchema();
  }
};

export const writeHighScores = (schema: HighScoreSchema): void => {
  window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(schema));
};

export const getHighScoresForGame = (gameId: GameId): ScoreEntry[] => {
  return readHighScores()[gameId];
};

export const saveGameScore = (gameId: GameId, score: number): ScoreEntry[] => {
  if (!Number.isInteger(score) || score < 0) {
    throw new Error('Score must be a non-negative integer.');
  }

  const all = readHighScores();
  const entry: ScoreEntry = {
    score,
    createdAt: new Date().toISOString(),
  };

  all[gameId] = normalizeEntries([...all[gameId], entry]);
  writeHighScores(all);

  return all[gameId];
};
