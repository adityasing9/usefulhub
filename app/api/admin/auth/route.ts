import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createSessionToken,
  isRateLimited,
  recordLoginAttempt,
  verifyPassword,
  verifySessionToken,
} from '../../../../src/utils/adminAuth';

export const dynamic = 'force-dynamic';

function getClientIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown-client';
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('usefulhub_admin_session')?.value;
  const valid = await verifySessionToken(sessionToken);

  return NextResponse.json({ authenticated: valid });
}

export async function POST(req: NextRequest) {
  const ip = getClientIdentifier(req);
  const rateLimitStatus = isRateLimited(ip);

  if (rateLimitStatus.locked) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many failed login attempts. Please wait ${rateLimitStatus.remainingSeconds} seconds before trying again.`,
      },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request payload.' },
      { status: 400 }
    );
  }

  const { password } = body;
  if (!password || !verifyPassword(password)) {
    recordLoginAttempt(ip, false);
    return NextResponse.json(
      { success: false, error: 'Incorrect administrator password.' },
      { status: 401 }
    );
  }

  // Password correct
  recordLoginAttempt(ip, true);
  const token = await createSessionToken();

  const cookieStore = await cookies();
  cookieStore.set('usefulhub_admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return NextResponse.json({ success: true, authenticated: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('usefulhub_admin_session');
  return NextResponse.json({ success: true, authenticated: false });
}
