import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const category = searchParams.get('category');
  
  if (id) {
    const market = await prisma.market.findUnique({ 
      where: { id: parseInt(id) }
    });
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }
    const comments = await prisma.comment.findMany({
      where: { marketId: market.id }
    });
    return NextResponse.json({ market, comments });
  }

  const markets = await prisma.market.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return NextResponse.json({ markets });
}