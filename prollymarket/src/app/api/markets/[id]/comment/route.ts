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
    const { marketId, content } = body;

    if (!marketId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content required' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 });
    }

    const market = await db.market.findUnique({ where: { id: marketId } });
    if (!market) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    const comment = await db.comment.create({
      userId: decoded.userId,
      marketId,
      content: content.trim()
    });

    await db.market.update({
      where: { id: marketId },
      data: { commentCount: { increment: 1 } }
    });

    // Return comment with user info
    const commentWithUser = await db.comment.findUnique({
      where: { id: comment.id },
      include: { user: { select: { username: true, displayName: true } } }
    });

    return NextResponse.json({ comment: commentWithUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}