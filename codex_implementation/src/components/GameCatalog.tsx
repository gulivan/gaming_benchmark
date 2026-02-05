import { GAMES } from '../data/games';
import { GameCard } from './GameCard';

export const GameCatalog = () => {
  return (
    <section aria-labelledby="catalog-title" className="catalog-section">
      <div className="section-heading-row">
        <h2 id="catalog-title">Game Catalog</h2>
        <p>6 games ready to play</p>
      </div>
      <div className="catalog-grid">
        {GAMES.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
};
