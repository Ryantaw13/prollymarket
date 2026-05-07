import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

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

    const body = await request.json();
    const { marketId, outcome } = body;

    if (!marketId || !outcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (outcome !== 'YES' && outcome !== 'NO') {
      return NextResponse.json({ error: 'Outcome must be YES or NO' }, { status: 400 });
    }

    // Check user is the creator
    const market = await db.market.findUnique({ where: { id: marketId } });
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    if (market.creatorId !== decoded.userId) {
      return NextResponse.json({ error: 'Only the market creator can resolve' }, { status: 403 });
    }

    if (market.isResolved) {
      return NextResponse.json({ error: 'Market already resolved' }, { status: 400 });
    }

    // Payout winners
    const bets = await db.bet.findMany({ where: { marketId } as any });
    
    for (const bet of bets) {
      if (bet.outcome === outcome) {
        const payout = bet.amount / bet.price;
        await db.bet.update({
          where: { id: bet.id },
          data: { payout, realized: true },
        });
        // Update user balance
        const user = await db.user.findUnique({ where: { id: bet.userId } });
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: { balance: user.balance + payout },
          });
        }
      } else {
        await db.bet.update({
          where: { id: bet.id },
          data: { payout: 0, realized: true },
        });
      }
    }

    const updated = await db.market.update({
      where: { id: marketId },
      data: { isResolved: true, outcome },
    });

    return NextResponse.json({ market: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to resolve market' }, { status: 500 });
  }
}