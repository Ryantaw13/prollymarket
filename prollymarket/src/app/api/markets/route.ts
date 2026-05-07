import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') || 'newest';
  
  if (id) {
    const market = await prisma.market.findUnique({ 
      where: { id: parseInt(id) },
      include: { 
        creator: { select: { id: true, username: true, displayName: true } },
        _count: { select: { comments: true, bets: true } }
      }
    });
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }
    const comments = await db.comment.findMany({
      where: { marketId: market.id },
      include: { user: { select: { username: true, displayName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json({ market, comments });
  }

  let where = {};
  if (category && category !== 'all') {
    where = { category };
  }

  let orderBy = { createdAt: 'desc' as const };
  if (sort === 'trending') {
    orderBy = { volume24h: 'desc' as const };
  } else if (sort === 'volume') {
    orderBy = { volume: 'desc' as const };
  } else if (sort === 'closing') {
    orderBy = { endDate: 'asc' as const };
  }

  const markets = await db.market.findMany({
    where,
    orderBy,
    include: { 
      creator: { select: { id: true, username: true, displayName: true } },
      _count: { select: { bets: true } }
    },
    take: 100
  });

  return NextResponse.json({ markets });
}