import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { HighScoreList } from '../components/HighScoreList';
import { SubmitScoreDialog } from '../components/SubmitScoreDialog';
import { GAMES } from '../data/games';
import { GAME_COMPONENTS } from '../games';
import { getHighScoresForGame, saveGameScore } from '../services/highScores';
import { NotFoundPage } from './NotFoundPage';

export const GamePage = () => {
  const { gameId } = useParams();
  const game = GAMES.find((item) => item.id === gameId);

  const [scores, setScores] = useState(() => (game ? getHighScoresForGame(game.id) : []));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingScore, setPendingScore] = useState(0);

  useEffect(() => {
    if (!game) {
      return;
    }

    setScores(getHighScoresForGame(game.id));
    setDialogOpen(false);
    setPendingScore(0);
  }, [game?.id]);

  if (!game) {
    return <NotFoundPage />;
  }

  const GameComponent = GAME_COMPONENTS[game.id];

  const onGameOver = (score: number) => {
    setPendingScore(Math.max(0, Math.floor(score)));
    setDialogOpen(true);
  };

  const onSaveScore = (score: number) => {
    const nextScores = saveGameScore(game.id, score);
    setScores(nextScores);
    setDialogOpen(false);
  };

  return (
    <main className="page game-page">
      <div className="game-page-head">
        <Link to="/" className="home-link">
          Back to hub
        </Link>
        <h1>{game.title}</h1>
        <p>{game.description}</p>
      </div>

      <div className="game-layout">
        <section className="play-panel">
          <p className="controls-text">
            <strong>Controls:</strong> {game.controls}
          </p>
          <GameComponent onGameOver={onGameOver} />
        </section>

        <HighScoreList title={game.title} scores={scores} />
      </div>

      <SubmitScoreDialog
        open={dialogOpen}
        gameTitle={game.title}
        initialScore={pendingScore}
        onSave={onSaveScore}
        onClose={() => setDialogOpen(false)}
      />
    </main>
  );
};
