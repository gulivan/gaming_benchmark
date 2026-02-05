import { VALID_WORDS } from './wordList';

export type LetterState = 'correct' | 'present' | 'absent';

export type GuessResult = {
  letter: string;
  state: LetterState;
}[];

export function evaluateGuess(guess: string, target: string): GuessResult {
  const result: GuessResult = [];
  const targetLetters = target.split('');
  const guessLetters = guess.split('');

  // First pass: mark correct letters and track remaining target letters
  const markedTargetIndices = new Set<number>();
  const remainingTargetLetters: Record<string, number> = {};

  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = { letter: guessLetters[i], state: 'correct' };
      markedTargetIndices.add(i);
    } else {
      // Count unmarked target letters for "present" logic
      for (let j = 0; j < targetLetters.length; j++) {
        if (!markedTargetIndices.has(j) && targetLetters[j] === guessLetters[i]) {
          remainingTargetLetters[guessLetters[i]] = (remainingTargetLetters[guessLetters[i]] || 0) + 1;
        }
      }
    }
  }

  // Second pass: mark present and absent letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (result[i]) {
      // Already marked as correct
      continue;
    }

    const letter = guessLetters[i];
    if (remainingTargetLetters[letter] > 0) {
      result[i] = { letter, state: 'present' };
      remainingTargetLetters[letter]--;
    } else {
      result[i] = { letter, state: 'absent' };
    }
  }

  return result;
}

export function isValidWord(word: string): boolean {
  return VALID_WORDS.has(word.toUpperCase());
}
