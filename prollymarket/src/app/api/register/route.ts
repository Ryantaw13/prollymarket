import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createToken, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, displayName } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
    }

    const user = await db.user.create({
      username,
      email,
      passwordHash: hashPassword(password),
      displayName: displayName || username,
    });

    const token = createToken(user.id);

    return NextResponse.json({
      user: { id: user.id, username: user.username, displayName: user.displayName, balance: user.balance },
      token,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}