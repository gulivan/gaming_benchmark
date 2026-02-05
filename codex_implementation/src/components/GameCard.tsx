import { Link } from 'react-router-dom';
import type { GameMeta } from '../types/game';

interface GameCardProps {
  game: GameMeta;
}

export const GameCard = ({ game }: GameCardProps) => {
  return (
    <article className="game-card">
      <div className="game-card-thumb" aria-hidden="true">
        {game.thumbnail}
      </div>
      <div className="game-card-content">
        <h2>{game.title}</h2>
        <p>{game.description}</p>
        <span className="game-status">{game.status}</span>
      </div>
      <Link to={game.route} className="game-link">
        Play
      </Link>
    </article>
  );
};
