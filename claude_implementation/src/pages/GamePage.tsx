import { Suspense, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router';
import { GAME_MAP } from '../data/games';
import { GAME_COMPONENTS } from '../data/gameComponents';
import { getHighScores, addHighScore } from '../services/highScores';
import { HighScoreList } from '../components/HighScoreList';
import { SubmitScoreDialog } from '../components/SubmitScoreDialog';
import type { ScoreEntry } from '../types/score';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? GAME_MAP.get(gameId) : undefined;
  const GameComponent = gameId ? GAME_COMPONENTS[gameId] : undefined;

  const [scores, setScores] = useState<ScoreEntry[]>(() =>
    gameId ? getHighScores(gameId) : []
  );
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const hasCalledGameOver = useRef(false);

  const onGameOver = useCallback((score: number) => {
    if (hasCalledGameOver.current) return;
    hasCalledGameOver.current = true;
    setFinalScore(score);
    setDialogOpen(true);
  }, []);

  function handleSubmitScore(playerName: string) {
    if (!gameId || finalScore === null) return;
    const updated = addHighScore(gameId, playerName, finalScore);
    setScores(updated);
    setDialogOpen(false);
    setFinalScore(null);
  }

  function handlePlayAgain() {
    hasCalledGameOver.current = false;
    setFinalScore(null);
    setDialogOpen(false);
    setGameKey((k) => k + 1);
  }

  if (!game || !GameComponent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Game not found</h1>
          <Link to="/" className="text-purple-400 hover:text-purple-300 underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-purple-400 hover:text-purple-300 text-sm">
            &larr; Back to Games
          </Link>
          <h1 className="text-xl font-bold text-white">
            {game.emoji} {game.title}
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex justify-center">
          <Suspense
            fallback={
              <div className="text-gray-400 text-lg animate-pulse">Loading game...</div>
            }
          >
            <GameComponent key={gameKey} onGameOver={onGameOver} />
          </Suspense>
        </div>

        <aside className="lg:w-72 shrink-0">
          <h2 className="text-lg font-bold text-white mb-4">High Scores</h2>
          <HighScoreList scores={scores} />
          {finalScore !== null && !dialogOpen && (
            <button
              onClick={handlePlayAgain}
              className="mt-6 w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
            >
              Play Again
            </button>
          )}
        </aside>
      </div>

      <SubmitScoreDialog
        score={finalScore ?? 0}
        open={dialogOpen}
        onSubmit={handleSubmitScore}
      />
    </div>
  );
}
