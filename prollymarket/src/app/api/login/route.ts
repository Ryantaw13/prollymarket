import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { username } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = createToken(user.id);

    return NextResponse.json({
      user: { id: user.id, username: user.username, displayName: user.displayName, balance: user.balance },
      token,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}