import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');

  if (id) {
    const market = await db.market.findUnique({ where: { id: parseInt(id) } });
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }
    const bets = await db.bet.findMany({ where: { marketId: market.id } } as any);
    return NextResponse.json({ market, bets });
  }

  let where = {};
  if (category) {
    where = { category };
  }

  const markets = await db.market.findMany({ where } as any);

  return NextResponse.json({ markets });
}