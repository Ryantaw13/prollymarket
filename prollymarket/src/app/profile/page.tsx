'use client';

import { useState, useEffect } from 'react';

interface UserStats {
  id: number;
  username: string;
  displayName: string;
  balance: number;
  streakDays: number;
  achievements: string[];
  createdAt: string;
}

interface UserBet {
  id: number;
  amount: number;
  outcome: string;
  price: number;
  payout: number | null;
  realized: boolean;
  market: {
    id: number;
    question: string;
    outcome: string | null;
    isResolved: boolean;
  };
}

interface Stats {
  totalBets: number;
  totalProfit: number;
  winRate: number;
  activeBets: number;
  closedBets: number;
}

export default function Profile() {
  const [user, setUser] = useState<UserStats | null>(null);
  const [bets, setBets] = useState<UserBet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'closed' | 'created'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setBets(data.bets || []);
        
        // Calculate stats
        const allBets = data.bets || [];
        const closedBets = allBets.filter((b: any) => b.realized);
        const activeBets = allBets.filter((b: any) => !b.realized);
        
        let totalProfit = 0;
        let wins = 0;
        
        for (const bet of closedBets) {
          if (bet.payout != null) {
            const profit = bet.payout - bet.amount;
            totalProfit += profit;
            if (profit > 0) wins++;
          }
        }
        
        setStats({
          totalBets: allBets.length,
          totalProfit: Math.round(totalProfit * 100) / 100,
          winRate: closedBets.length > 0 ? Math.round((wins / closedBets.length) * 100) : 0,
          activeBets: activeBets.length,
          closedBets: closedBets.length
        });
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => (price * 100).toFixed(0) + '¢';

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!user) {
    return <div className="card text-center py-12">Please login to view profile</div>;
  }

  const achievementList = user.achievements ? JSON.parse(user.achievements) : [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {user.displayName?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
            <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
          </div>
          <div className="ml-auto text-right">
            <div className="text-3xl font-bold text-green-600">${user.balance.toFixed(2)}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
            {user.streakDays > 0 && (
              <div className="text-orange-500 font-medium">
                🔥 {user.streakDays} day streak
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold">{stats.totalBets}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Bets</div>
          </div>
          <div className="card text-center">
            <div className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Profit</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Win Rate</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold">{stats.activeBets}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active</div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievementList.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-medium mb-3">Achievements</h2>
          <div className="flex flex-wrap gap-2">
            {achievementList.map((achievement: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'active' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Active ({stats?.activeBets || 0})
        </button>
        <button
          onClick={() => setActiveTab('closed')}
          className={`px-4 py-2 rounded-lg ${activeTab === 'closed' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Closed ({stats?.closedBets || 0})
        </button>
      </div>

      {/* Bet List */}
      <div className="card">
        {activeTab === 'active' && (
          <h2 className="font-medium mb-3">Active Positions</h2>
        )}
        {activeTab === 'closed' && (
          <h2 className="font-medium mb-3">Closed Positions</h2>
        )}
        
        {(activeTab === 'active' ? bets.filter(b => !b.realized) : bets.filter(b => b.realized)).length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No {activeTab} bets</p>
        ) : (
          <div className="space-y-3">
            {(activeTab === 'active' ? bets.filter(b => !b.realized) : bets.filter(b => b.realized)).slice(0, 20).map((bet: any) => (
              <div key={bet.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium">{bet.market?.question || `Market #${bet.marketId}`}</div>
                  <div className="text-sm">
                    <span className={bet.outcome === 'YES' ? 'text-green-600' : 'text-red-600'}>
                      {bet.outcome}
                    </span>
                    {' @ '}
                    {formatPrice(bet.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${bet.amount.toFixed(2)}</div>
                  {bet.realized && (
                    <div className={`text-sm ${(bet.payout || 0) >= bet.amount ? 'text-green-600' : 'text-red-600'}`}>
                      {bet.payout != null ? `$${bet.payout.toFixed(2)}` : '$0.00'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}