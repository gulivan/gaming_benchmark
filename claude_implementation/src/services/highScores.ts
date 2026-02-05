import type { ScoreEntry, HighScoreStore } from '../types/score';

const STORAGE_KEY = 'gameHub.highScores.v1';
const MAX_SCORES = 10;

function loadStore(): HighScoreStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    return parsed as HighScoreStore;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return {};
  }
}

function saveStore(store: HighScoreStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // localStorage full or unavailable -- silently fail
  }
}

export function getHighScores(gameId: string): ScoreEntry[] {
  const store = loadStore();
  return store[gameId] ?? [];
}

export function addHighScore(gameId: string, playerName: string, score: number): ScoreEntry[] {
  const store = loadStore();
  const entries = store[gameId] ?? [];

  const entry: ScoreEntry = {
    playerName: playerName.trim().slice(0, 20) || 'Anonymous',
    score,
    date: new Date().toISOString(),
  };

  entries.push(entry);
  entries.sort((a, b) => b.score - a.score);
  store[gameId] = entries.slice(0, MAX_SCORES);
  saveStore(store);

  return store[gameId];
}
