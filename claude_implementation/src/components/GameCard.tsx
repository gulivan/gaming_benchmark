import { Link } from 'react-router';
import type { GameDefinition } from '../types/game';

export function GameCard({ game }: { game: GameDefinition }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="group block rounded-2xl bg-gray-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
    >
      <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
        <span className="text-5xl group-hover:scale-110 transition-transform">
          {game.emoji}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{game.description}</p>
      </div>
    </Link>
  );
}
