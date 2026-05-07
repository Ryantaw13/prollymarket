import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { createMarket, getUserById } from '@/lib/store';

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
    const { question, description, category, imageUrl, closesAt } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const market = createMarket({
      question,
      description,
      category: category || 'general',
      imageUrl,
      closesAt,
      creatorId: user.id,
    });

    return NextResponse.json({ market });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create market' }, { status: 500 });
  }
}