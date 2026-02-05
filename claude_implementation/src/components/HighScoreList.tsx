import type { ScoreEntry } from '../types/score';

export function HighScoreList({ scores }: { scores: ScoreEntry[] }) {
  if (scores.length === 0) {
    return <p className="text-gray-500 text-sm italic">No scores yet. Be the first!</p>;
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-gray-400 border-b border-gray-700">
          <th className="text-left py-2 w-8">#</th>
          <th className="text-left py-2">Player</th>
          <th className="text-right py-2">Score</th>
        </tr>
      </thead>
      <tbody>
        {scores.map((entry, i) => (
          <tr key={`${entry.date}-${i}`} className="border-b border-gray-800">
            <td className="py-2 text-gray-500">{i + 1}</td>
            <td className="py-2 text-white">{entry.playerName}</td>
            <td className="py-2 text-right text-purple-300 font-mono">
              {entry.score.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
