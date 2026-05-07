import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

const REFERRAL_BONUS = 10;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || request.cookies.get('token')?.value;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const user = await db.user.findUnique({ 
    where: { id: decoded.userId },
    include: { 
      referredByUser: { select: { username: true, displayName: true } },
      referredUsers: { select: { username: true, displayName: true, createdAt: true } }
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Generate referral code if not exists
  let referralCode = user.referralCode;
  if (!referralCode) {
    referralCode = crypto.randomBytes(4).toString('hex');
    await db.user.update({
      where: { id: user.id },
      data: { referralCode }
    });
  }

  return NextResponse.json({
    referralCode,
    referrer: user.referredByUser,
    referredCount: user.referredUsers.length,
    referredUsers: user.referredUsers
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, username, email, password, displayName } = body;

    if (!referralCode || !username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find referrer
    const referrer = await db.user.findUnique({ where: { referralCode } });
    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
    }

    // Check username/email not taken
    const existing = await db.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existing) {
      return NextResponse.json({ error: 'Username or email already taken' }, { status: 400 });
    }

    // Create new user with referral
    const newUser = await db.user.create({
      username,
      email,
      passwordHash: hashPassword(password),
      displayName: displayName || username,
      referralCode: crypto.randomBytes(4).toString('hex'),
      referredBy: referrer.id,
      approved: true,
      balance: 1000 + REFERRAL_BONUS  // New user gets signup bonus + referral bonus
    });

    // Bonus for referrer
    await db.user.update({
      where: { id: referrer.id },
      data: { balance: referrer.balance + REFERRAL_BONUS }
    });

    return NextResponse.json({ 
      success: true,
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        displayName: newUser.displayName, 
        balance: newUser.balance 
      },
      bonusReceived: REFERRAL_BONUS
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}