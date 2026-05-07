import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || 'all';
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      balance: true,
      streakDays: true,
      achievements: true,
      createdAt: true
    },
    orderBy: { balance: 'desc' },
    take: 50
  });

  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const bets = await prisma.bet.findMany({ where: { userId: user.id } });
      
      const totalBets = bets.length;
      const realizedBets = bets.filter(b => b.realized);
      
      let totalProfit = 0;
      let wins = 0;
      
      for (const bet of realizedBets) {
        if (bet.payout !== null && bet.payout !== undefined) {
          const profit = bet.payout - bet.amount;
          totalProfit += profit;
          if (profit > 0) wins++;
        }
      }
      
      const winRate = totalBets > 0 ? Math.round((wins / totalBets) * 100) : 0;
      
      return {
        user,
        totalBets,
        totalProfit: Math.round(totalProfit * 100) / 100,
        winRate,
        rank: 0
      };
    })
  );

  leaderboard.sort((a, b) => {
    if (b.totalProfit !== a.totalProfit) {
      return b.totalProfit - a.totalProfit;
    }
    return b.totalBets - a.totalBets;
  });

  leaderboard.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return NextResponse.json({ leaderboard });
}