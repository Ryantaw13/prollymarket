import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || request.cookies.get('token')?.value;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [bets, markets, comments, referrals] = await Promise.all([
    prisma.bet.findMany({ where: { userId: user.id } }),
    prisma.market.findMany({ where: { creatorId: user.id } }),
    prisma.comment.findMany({ where: { userId: user.id } }),
    prisma.user.findMany({ where: { referredBy: user.id } })
  ]);

  const totalBets = bets.length;
  const closedBets = bets.filter(b => b.realized);
  let wins = 0;
  
  for (const bet of closedBets) {
    if (bet.payout != null && bet.payout > bet.amount) {
      wins++;
    }
  }

  // Calculate achievements
  const earned: string[] = [];
  
  if (totalBets >= 1) earned.push('first_bet');
  if (totalBets >= 10) earned.push('ten_bets');
  if (totalBets >= 50) earned.push('fifty_bets');
  if (wins >= 1) earned.push('first_win');
  if (wins >= 10) earned.push('ten_wins');
  if ((user.streakDays || 0) >= 3) earned.push('streak_3');
  if ((user.streakDays || 0) >= 7) earned.push('streak_7');
  if (referrals.length >= 1) earned.push('referral_1');
  if (markets.length >= 1) earned.push('creator');
  if (comments.length >= 5) earned.push('commenter');

  // Update achievements if changed
  const currentAchievements = user.achievements ? JSON.parse(user.achievements) : [];
  const newAchievements = earned.filter(a => !currentAchievements.includes(a));
  
  if (newAchievements.length > 0) {
    const allAchievements = [...new Set([...currentAchievements, ...earned])];
    await prisma.user.update({
      where: { id: user.id },
      data: { achievements: JSON.stringify(allAchievements) }
    });
  }

  return NextResponse.json({
    stats: {
      totalBets,
      wins,
      comments: comments.length,
      marketsCreated: markets.length,
      referrals: referrals.length
    },
    earnedAchievements: earned
  });
}