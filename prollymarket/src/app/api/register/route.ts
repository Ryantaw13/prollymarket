import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserByEmail, createUser } from '@/lib/store';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, displayName } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (getUserByUsername(username)) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    if (getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
    }

    const user = createUser({
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
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}