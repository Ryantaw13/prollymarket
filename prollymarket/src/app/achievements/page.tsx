'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_bet', name: 'First Bet', description: 'Place your first bet', icon: '🎯', requirement: 1 },
  { id: 'ten_bets', name: 'Getting Started', description: 'Place 10 bets', icon: '🔥', requirement: 10 },
  { id: 'fifty_bets', name: 'Active Trader', description: 'Place 50 bets', icon: '📊', requirement: 50 },
  { id: 'first_win', name: 'First Win', description: 'Win a bet', icon: '🏆', requirement: 1 },
  { id: 'ten_wins', name: 'Winning Streak', description: 'Win 10 bets', icon: '⭐', requirement: 10 },
  { id: 'streak_3', name: '3 Day Streak', description: 'Login 3 days in a row', icon: '🔥', requirement: 3 },
  { id: 'streak_7', name: 'Weekly Streak', description: 'Login 7 days in a row', icon: '💪', requirement: 7 },
  { id: 'referral_1', name: 'First Referral', description: 'Refer 1 user', icon: '👥', requirement: 1 },
  { id: 'creator', name: 'Market Creator', description: 'Create a market', icon: '📝', requirement: 1 },
  { id: 'commenter', name: 'Community', description: 'Leave 5 comments', icon: '💬', requirement: 5 },
];

export default function Achievements() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/me').then(r => r.json()),
      fetch('/api/stats').then(r => r.json()).catch(() => ({ stats: {} }))
    ]).then(([userData, statsData]) => {
      setUser(userData.user);
      setStats(statsData.stats);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <div className="card text-center py-12">Please login</div>;
  }

  const earnedAchievements = user.achievements ? JSON.parse(user.achievements) : [];
  const totalBets = stats?.totalBets || 0;
  const totalWins = stats?.wins || 0;
  const commentCount = stats?.comments || 0;
  const referralCount = stats?.referrals || 0;

  const checkAchievement = (achievement: Achievement) => {
    switch (achievement.id) {
      case 'first_bet': return totalBets >= 1;
      case 'ten_bets': return totalBets >= 10;
      case 'fifty_bets': return totalBets >= 50;
      case 'first_win': return totalWins >= 1;
      case 'ten_wins': return totalWins >= 10;
      case 'streak_3': return (user.streakDays || 0) >= 3;
      case 'streak_7': return (user.streakDays || 0) >= 7;
      case 'referral_1': return referralCount >= 1;
      case 'creator': return stats?.marketsCreated >= 1;
      case 'commenter': return commentCount >= 5;
      default: return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Achievements</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map(achievement => {
          const earned = earnedAchievements.includes(achievement.id);
          const progress = checkAchievement(achievement);
          
          return (
            <div 
              key={achievement.id}
              className={`card text-center p-4 ${
                earned 
                  ? 'border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' 
                  : 'opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <div className="font-medium text-sm">{achievement.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {achievement.description}
              </div>
              {earned && (
                <div className="text-xs text-green-600 mt-2 font-bold">✓ Unlocked!</div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-gray-500 mt-6">
        {earnedAchievements.length} / {ACHIEVEMENTS.length} Unlocked
      </p>
    </div>
  );
}