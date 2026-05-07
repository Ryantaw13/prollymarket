import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
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
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { marketId, amount, outcome } = body;

    if (!marketId || !amount || !outcome) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (outcome !== 'YES' && outcome !== 'NO') {
      return NextResponse.json({ error: 'Outcome must be YES or NO' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 });
    }

    const market = await db.market.findUnique({ where: { id: marketId } });
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    if (market.isResolved) {
      return NextResponse.json({ error: 'Market is already resolved' }, { status: 400 });
    }

    const price = outcome === 'YES' ? market.yesPrice : market.noPrice;
    const cost = amount * price;

    if (user.balance < cost) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: { balance: user.balance - cost },
    });

    const bet = await db.bet.create({
      userId: user.id,
      marketId,
      amount,
      outcome,
      price,
    });

    await db.market.update({
      where: { id: marketId },
      data: { volume: market.volume + Math.round(cost * 100) / 100 },
    });

    const updatedMarket = await db.market.findUnique({ where: { id: marketId } });

    return NextResponse.json({
      bet,
      balance: user.balance - cost,
      market: updatedMarket,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to place bet' }, { status: 500 });
  }
}