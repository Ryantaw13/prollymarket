'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    username: string;
    displayName: string;
    balance: number;
    streakDays: number;
  };
  totalBets: number;
  totalProfit: number;
  winRate: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetch(`/api/leaderboard?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(data => {
        setEntries(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [timeframe]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      {/* Timeframe Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeframe('all')}
          className={`px-3 py-1 rounded ${timeframe === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          All Time
        </button>
        <button
          onClick={() => setTimeframe('month')}
          className={`px-3 py-1 rounded ${timeframe === 'month' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          This Month
        </button>
        <button
          onClick={() => setTimeframe('week')}
          className={`px-3 py-1 rounded ${timeframe === 'week' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
          This Week
        </button>
      </div>

      {/* Top 3 */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="card text-center order-1">
            <div className="text-4xl mb-2">🥈</div>
            <div className="font-bold text-lg">{entries[1].user.displayName || entries[1].user.username}</div>
            <div className="text-gray-500 dark:text-gray-400">${entries[1].totalProfit.toFixed(2)}</div>
            <div className="text-sm text-gray-500">{entries[1].totalBets} bets</div>
          </div>
          
          {/* 1st Place */}
          <div className="card text-center order-2 border-2 border-yellow-400">
            <div className="text-4xl mb-2">🥇</div>
            <div className="font-bold text-lg">{entries[0].user.displayName || entries[0].user.username}</div>
            <div className="text-green-600 font-bold">${entries[0].totalProfit.toFixed(2)}</div>
            <div className="text-sm text-gray-500">{entries[0].totalBets} bets</div>
          </div>
          
          {/* 3rd Place */}
          <div className="card text-center order-3">
            <div className="text-4xl mb-2">🥉</div>
            <div className="font-bold text-lg">{entries[2].user.displayName || entries[2].user.username}</div>
            <div className="text-gray-500 dark:text-gray-400">${entries[2].totalProfit.toFixed(2)}</div>
            <div className="text-sm text-gray-500">{entries[2].totalBets} bets</div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
              <th className="pb-2">Rank</th>
              <th className="pb-2">User</th>
              <th className="pb-2 text-right">Profit</th>
              <th className="pb-2 text-right">Bets</th>
              <th className="pb-2 text-right">Win %</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.rank} className="border-t border-gray-200 dark:border-gray-700">
                <td className="py-2 font-medium">#{entry.rank}</td>
                <td className="py-2">
                  <div className="font-medium">{entry.user.displayName || entry.user.username}</div>
                  <div className="text-xs text-gray-500">@{entry.user.username}</div>
                </td>
                <td className={`py-2 text-right ${entry.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entry.totalProfit >= 0 ? '+' : ''}{entry.totalProfit.toFixed(2)}
                </td>
                <td className="py-2 text-right">{entry.totalBets}</td>
                <td className="py-2 text-right">{entry.winRate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {entries.length === 0 && (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">
            No traders yet. Be the first to place a bet!
          </p>
        )}
      </div>
    </div>
  );
}