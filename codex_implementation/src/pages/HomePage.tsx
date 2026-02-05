import { GameCatalog } from '../components/GameCatalog';
import { Hero } from '../components/Hero';

export const HomePage = () => {
  return (
    <main className="page">
      <Hero />
      <GameCatalog />
    </main>
  );
};
