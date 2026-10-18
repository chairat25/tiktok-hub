import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode') || 'login'; // 'login' | 'link'

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) {
    return NextResponse.json(
      {
        success: false,
        message: 'TIKTOK_CLIENT_KEY ยังไม่ได้กำหนดใน Environment Variables',
      },
      { status: 500 }
    );
  }

  // Derive host redirect URI
  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/callback`;

  // CSRF / state
  const statePayload = {
    mode,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(7),
  };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

  const tiktokAuthUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
  tiktokAuthUrl.searchParams.set('client_key', clientKey);
  tiktokAuthUrl.searchParams.set('scope', 'user.info.basic,user.info.profile');
  tiktokAuthUrl.searchParams.set('response_type', 'code');
  tiktokAuthUrl.searchParams.set('redirect_uri', redirectUri);
  tiktokAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(tiktokAuthUrl.toString());
}
