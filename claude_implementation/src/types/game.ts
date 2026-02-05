export interface GameDefinition {
  id: string;
  title: string;
  description: string;
  color: string;
  emoji: string;
}

export interface GameProps {
  onGameOver: (score: number) => void;
}
