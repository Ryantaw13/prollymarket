import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Get start of week (Monday)
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export async function GET(request: NextRequest) {
  const weekStart = getWeekStart();

  // Get all bets this week
  const allBets = await prisma.bet.findMany({
    where: {
      realized: true,
      createdAt: { gte: weekStart }
    },
    include: {
      user: { select: { username: true, displayName: true } }
    }
  });

  // Group by user and calculate profit
  const userStats = new Map();
  
  for (const bet of allBets) {
    const userId = bet.userId;
    if (!userStats.has(userId)) {
      userStats.set(userId, {
        userId,
        username: bet.user.username,
        displayName: bet.user.displayName || bet.user.username,
        profit: 0,
        bets: 0
      });
    }
    
    const stats = userStats.get(userId);
    stats.profit += (bet.payout || 0) - bet.amount;
    stats.bets += 1;
  }

  // Sort by profit
  const contest = Array.from(userStats.values())
    .sort((a: any, b: any) => b.profit - a.profit)
    .slice(0, 20)
    .map((entry: any, i: number) => ({
      rank: i + 1,
      username: entry.username,
      displayName: entry.displayName,
      profit: Math.round(entry.profit * 100) / 100,
      bets: entry.bets
    }));

  // Get current user's rank
  const authHeader = request.headers.get('authorization') || request.cookies.get('token')?.value;
  let userRank = null;
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    if (decoded) {
      userRank = contest.findIndex((e: any) => e.userId === decoded.userId) + 1;
    }
  }

  return NextResponse.json({ contest, userRank });
}