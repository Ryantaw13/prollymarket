import { NextRequest, NextResponse } from 'next/server';
import { getMarkets, getMarketById, getBets } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');

  if (id) {
    const market = getMarketById(parseInt(id));
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }
    const marketBets = getBets().filter(b => b.marketId === market.id);
    return NextResponse.json({ market, bets: marketBets });
  }

  let markets = getMarkets();
  if (category) {
    markets = markets.filter(m => m.category === category);
  }

  return NextResponse.json({ markets });
}