import { Hero } from '../components/Hero';
import { GameCatalog } from '../components/GameCatalog';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Hero />
      <GameCatalog />
    </div>
  );
}
