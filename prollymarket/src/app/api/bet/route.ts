import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createBet, getUserById, getMarketById, updateUserBalance } from '@/lib/store';

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

    const user = getUserById(decoded.userId);
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

    const market = getMarketById(marketId);
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

    updateUserBalance(user.id, -cost);

    const bet = createBet({
      userId: user.id,
      marketId,
      amount,
      outcome,
    });

    if (!bet) {
      updateUserBalance(user.id, cost);
      return NextResponse.json({ error: 'Failed to place bet' }, { status: 500 });
    }

    const updatedMarket = getMarketById(marketId);

    return NextResponse.json({
      bet,
      balance: user.balance,
      market: updatedMarket,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to place bet' }, { status: 500 });
  }
}