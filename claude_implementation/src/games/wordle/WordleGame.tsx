import { useState, useEffect, useRef } from 'react';
import { getRandomWord } from './wordList';
import { evaluateGuess, isValidWord } from './wordleLogic';
import type { GuessResult } from './wordleLogic';

export type GameProps = {
  onGameOver: (score: number) => void;
};

type GameStatus = 'playing' | 'won' | 'lost';

const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export function WordleGame({ onGameOver }: GameProps) {
  const [targetWord] = useState(() => getRandomWord());
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const hasCalledGameOverRef = useRef(false);

  // Track which letters have been used and their states
  const letterStates = useRef<Record<string, LetterState>>({});

  type LetterState = 'correct' | 'present' | 'absent';

  const updateLetterStates = (result: GuessResult) => {
    for (const { letter, state } of result) {
      // Upgrade letter state: correct > present > absent
      const currentState = letterStates.current[letter];
      if (state === 'correct') {
        letterStates.current[letter] = 'correct';
      } else if (state === 'present' && currentState !== 'correct') {
        letterStates.current[letter] = 'present';
      } else if (state === 'absent' && !currentState) {
        letterStates.current[letter] = 'absent';
      }
    }
  };

  const calculateScore = (attemptNumber: number): number => {
    if (attemptNumber < 1 || attemptNumber > MAX_GUESSES) return 0;
    return MAX_GUESSES - attemptNumber + 1;
  };

  const handleSubmitGuess = () => {
    if (currentInput.length !== WORD_LENGTH) {
      return;
    }

    if (!isValidWord(currentInput)) {
      return;
    }

    const result = evaluateGuess(currentInput, targetWord);
    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    updateLetterStates(result);

    const isCorrect = currentInput === targetWord;
    const isLastGuess = newGuesses.length === MAX_GUESSES;

    if (isCorrect) {
      setGameStatus('won');
    } else if (isLastGuess) {
      setGameStatus('lost');
    }

    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitGuess();
    } else if (e.key === 'Backspace') {
      setCurrentInput((prev) => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(e.key) && currentInput.length < WORD_LENGTH) {
      setCurrentInput((prev) => (prev + e.key).toUpperCase());
    }
  };

  const handleOnScreenKeyPress = (letter: string) => {
    if (currentInput.length < WORD_LENGTH) {
      setCurrentInput((prev) => prev + letter);
    }
  };

  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleEnter = () => {
    handleSubmitGuess();
  };

  // Call onGameOver when game ends
  useEffect(() => {
    if ((gameStatus === 'won' || gameStatus === 'lost') && !hasCalledGameOverRef.current) {
      hasCalledGameOverRef.current = true;
      const attemptNumber = guesses.length + 1;
      const score = gameStatus === 'won' ? calculateScore(attemptNumber) : 0;
      onGameOver(score);
    }
  }, [gameStatus, guesses.length, onGameOver]);

  const renderGuessRow = (result: GuessResult | null, rowIndex: number) => {
    return (
      <div key={rowIndex} className="flex gap-2 mb-2">
        {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
          const letterData = result?.[colIndex];
          let bgColor = 'bg-gray-700 border border-gray-600';

          if (letterData) {
            if (letterData.state === 'correct') {
              bgColor = 'bg-green-600';
            } else if (letterData.state === 'present') {
              bgColor = 'bg-yellow-500';
            } else if (letterData.state === 'absent') {
              bgColor = 'bg-gray-600';
            }
          }

          return (
            <div
              key={colIndex}
              className={`w-12 h-12 flex items-center justify-center font-bold text-white text-lg rounded ${bgColor}`}
            >
              {letterData?.letter || ''}
            </div>
          );
        })}
      </div>
    );
  };

  const renderEmptyRows = (count: number, startIndex: number) => {
    return Array.from({ length: count }).map((_, i) => renderGuessRow(null, startIndex + i));
  };

  const getLetterColor = (letter: string): string => {
    const state = letterStates.current[letter];
    if (state === 'correct') return 'bg-green-600';
    if (state === 'present') return 'bg-yellow-500';
    if (state === 'absent') return 'bg-gray-600';
    return 'bg-gray-800 border border-gray-600';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-8">WORDLE</h1>

        {/* Game Grid */}
        <div className="mb-8">
          {guesses.map((result, idx) => renderGuessRow(result, idx))}
          {renderEmptyRows(MAX_GUESSES - guesses.length, guesses.length)}
        </div>

        {/* Current Input Display */}
        {gameStatus === 'playing' && (
          <div className="flex gap-2 mb-6 justify-center">
            {Array.from({ length: WORD_LENGTH }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 flex items-center justify-center font-bold text-white text-lg bg-gray-800 border border-gray-600 rounded"
              >
                {currentInput[i] || ''}
              </div>
            ))}
          </div>
        )}

        {/* Status Messages */}
        {gameStatus === 'won' && (
          <div className="text-center mb-6">
            <p className="text-green-500 font-bold text-lg">You Won!</p>
          </div>
        )}
        {gameStatus === 'lost' && (
          <div className="text-center mb-6">
            <p className="text-red-500 font-bold text-lg">Game Over!</p>
            <p className="text-gray-300 text-sm mt-1">The word was: {targetWord}</p>
          </div>
        )}

        {/* On-Screen Keyboard */}
        <div className="bg-gray-800 p-4 rounded">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-1 mb-2 justify-center">
              {row.split('').map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleOnScreenKeyPress(letter)}
                  disabled={gameStatus !== 'playing'}
                  className={`px-3 py-2 font-bold text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed ${getLetterColor(letter)}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}

          {/* Backspace and Enter Buttons */}
          <div className="flex gap-1 justify-center mt-2">
            <button
              onClick={handleBackspace}
              disabled={gameStatus !== 'playing'}
              className="px-4 py-2 bg-gray-700 text-white font-bold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Backspace
            </button>
            <button
              onClick={handleEnter}
              disabled={gameStatus !== 'playing'}
              className="px-4 py-2 bg-green-700 text-white font-bold rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
            >
              Enter
            </button>
          </div>
        </div>

        {/* Physical Keyboard Input (Hidden) */}
        <input
          ref={(input) => { if (gameStatus === 'playing') input?.focus(); }}
          type="text"
          value={currentInput}
          onChange={() => {}} // Controlled by keyboard events
          onKeyDown={handleKeyPress}
          className="absolute opacity-0 pointer-events-none"
          maxLength={WORD_LENGTH}
        />
      </div>
    </div>
  );
}
