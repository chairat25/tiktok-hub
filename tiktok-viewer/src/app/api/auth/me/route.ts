import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@tiktok/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('tiktok_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = verifySessionToken(token);
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({ authenticated: true, user });
}
