'use client';

import { useState, useEffect } from 'react';

interface ContestEntry {
  rank: number;
  username: string;
  displayName: string;
  profit: number;
  bets: number;
}

export default function WeeklyContest() {
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/contest')
      .then(res => res.json())
      .then(data => {
        setEntries(data.contest || []);
        setUserRank(data.userRank);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">🏆 Weekly Contest</h1>
          <p className="text-indigo-100">Make the most profit this week to win!</p>
          <div className="mt-4 text-3xl font-bold">$50 Prize</div>
          {userRank && (
            <div className="mt-2 text-lg">Your rank: #{userRank}</div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Weekly Leaderboard</h2>

      <div className="card">
        {entries.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No bets placed this week yet. Be the first!</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div 
                key={i} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  i === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  i === 1 ? 'bg-gray-100 dark:bg-gray-700' :
                  i === 2 ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold w-8">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </div>
                  <div>
                    <div className="font-medium">{entry.displayName || entry.username}</div>
                    <div className="text-xs text-gray-500">{entry.bets} bets</div>
                  </div>
                </div>
                <div className={`font-bold ${entry.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.profit >= 0 ? '+' : ''}{entry.profit.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-gray-500 text-sm mt-4">
        Contest resets every Monday at midnight
      </p>
    </div>
  );
}