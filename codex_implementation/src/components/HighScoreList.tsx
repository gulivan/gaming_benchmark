import type { ScoreEntry } from '../types/score';

interface HighScoreListProps {
  title: string;
  scores: ScoreEntry[];
}

export const HighScoreList = ({ title, scores }: HighScoreListProps) => {
  return (
    <section className="score-panel" aria-label={`${title} High Scores`}>
      <h3>{title} High Scores</h3>
      {scores.length === 0 ? (
        <p className="score-empty">No scores yet. Be the first.</p>
      ) : (
        <ol className="score-list">
          {scores.map((entry, index) => (
            <li key={`${entry.createdAt}-${index}`}>
              <span className="score-rank">#{index + 1}</span>
              <span className="score-value">{entry.score}</span>
              <time className="score-date" dateTime={entry.createdAt}>
                {new Date(entry.createdAt).toLocaleString()}
              </time>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};
