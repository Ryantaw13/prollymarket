import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const DAILY_BONUS_AMOUNT = 10;
const BONUS_COOLDOWN_HOURS = 24;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || request.cookies.get('token')?.value;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await db.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check last bonus
    const lastBonus = await db.dailyBonus.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 1
    });

    if (lastBonus.length > 0) {
      const hoursSince = (Date.now() - lastBonus[0].date.getTime()) / (1000 * 60 * 60);
      if (hoursSince < BONUS_COOLDOWN_HOURS) {
        const hoursLeft = Math.floor(BONUS_COOLDOWN_HOURS - hoursSince);
        return NextResponse.json({ 
          error: `Already claimed. Come back in ${hoursLeft} hours`,
          hoursLeft,
          lastClaimed: lastBonus[0].date
        }, { status: 400 });
      }
    }

    // Calculate streak bonus
    let bonusAmount = DAILY_BONUS_AMOUNT;
    let streakDays = user.streakDays || 0;
    
    // Check if this is consecutive day
    if (user.lastLogin) {
      const daysSinceLastLogin = (Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastLogin > 1 && daysSinceLastLogin < 2) {
        streakDays = streakDays + 1;
        // Streak bonus: +$1 per day, max +$10
        bonusAmount = Math.min(DAILY_BONUS_AMOUNT + streakDays, 20);
      } else if (daysSinceLastLogin >= 2) {
        streakDays = 1;  // Reset streak
      }
    } else {
      streakDays = 1;
    }

    // Award bonus
    await db.dailyBonus.create({
      userId: user.id,
      amount: bonusAmount
    });

    await db.user.update({
      where: { id: user.id },
      data: { 
        balance: user.balance + bonusAmount,
        lastLogin: new Date(),
        streakDays
      }
    });

    return NextResponse.json({ 
      success: true,
      bonusAmount,
      streakDays,
      totalBalance: user.balance + bonusAmount
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to claim bonus' }, { status: 500 });
  }
}

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

  const user = await db.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const lastBonus = await db.dailyBonus.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    take: 1
  });

  const canClaim = lastBonus.length === 0 || 
    (Date.now() - lastBonus[0].date.getTime()) / (1000 * 60 * 60) >= BONUS_COOLDOWN_HOURS;

  return NextResponse.json({ 
    canClaim,
    streakDays: user.streakDays || 0,
    lastClaimed: lastBonus[0]?.date || null
  });
}