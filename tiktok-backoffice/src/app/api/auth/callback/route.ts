import { NextRequest, NextResponse } from 'next/server';
import { getDataSource, User } from '@tiktok/database';
import { signSessionToken, verifySessionToken } from '@tiktok/auth';
import { UserRole } from '@tiktok/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDesc = searchParams.get('error_description');

  let mode = 'login';
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
      mode = parsed.mode || 'login';
    } catch {
      // ignore
    }
  }

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (error || !code) {
    const errorTarget = mode === 'link' ? `${baseUrl}/dashboard/settings?error=tiktok_denied` : `${baseUrl}/?error=tiktok_denied`;
    return NextResponse.redirect(errorTarget);
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/callback`;

  if (!clientKey || !clientSecret) {
    const target = mode === 'link'
      ? `${baseUrl}/dashboard/settings?error=missing_credentials`
      : `${baseUrl}/?error=missing_credentials`;
    return NextResponse.redirect(target);
  }

  try {
    // 1. Exchange code for Access Token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.data?.access_token) {
      console.error('[TIKTOK_TOKEN_EXCHANGE_ERROR]', tokenData);
      const target = mode === 'link'
        ? `${baseUrl}/dashboard/settings?error=token_exchange_failed`
        : `${baseUrl}/?error=token_exchange_failed`;
      return NextResponse.redirect(target);
    }

    const accessToken = tokenData.data.access_token;
    const openId = tokenData.data.open_id;

    // 2. Fetch User Profile
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const userData = await userRes.json();
    const tiktokProfile = userData.data?.user || {};
    const tiktokDisplayName = tiktokProfile.display_name || 'TikTok Creator';
    const tiktokAvatarUrl = tiktokProfile.avatar_url || null;

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    // MODE 1: LINKING ACCOUNT FROM SETTINGS
    if (mode === 'link') {
      const sessionToken = req.cookies.get('backoffice_session')?.value;
      const currentSession = sessionToken ? verifySessionToken(sessionToken) : null;

      if (!currentSession) {
        return NextResponse.redirect(`${baseUrl}/?error=unauthorized`);
      }

      // Check if another account already has this tiktokOpenId
      const existingLinked = await userRepo.findOne({
        where: { tiktokOpenId: openId },
      });

      if (existingLinked && existingLinked.id !== currentSession.id) {
        return NextResponse.redirect(`${baseUrl}/dashboard/settings?error=already_linked_other`);
      }

      await userRepo.update(currentSession.id, {
        tiktokOpenId: openId,
        tiktokUsername: tiktokDisplayName,
        tiktokAvatarUrl: tiktokAvatarUrl || undefined,
      });

      return NextResponse.redirect(`${baseUrl}/dashboard/settings?linked=success`);
    }

    // MODE 2: LOGIN VIA TIKTOK SSO
    let user = await userRepo.findOne({
      where: { tiktokOpenId: openId },
    });

    if (!user) {
      // Auto-provision new Creator account
      const uniqueSuffix = Math.random().toString(36).substring(2, 6);
      const cleanName = tiktokDisplayName.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'creator';
      const handle = `@${cleanName}_${uniqueSuffix}`;
      const placeholderEmail = `${cleanName}_${uniqueSuffix}@tiktok-hub.local`;

      const newUser = userRepo.create({
        email: placeholderEmail,
        displayName: tiktokDisplayName,
        creatorHandle: handle,
        avatarUrl: tiktokAvatarUrl || undefined,
        tiktokOpenId: openId,
        tiktokUsername: tiktokDisplayName,
        tiktokAvatarUrl: tiktokAvatarUrl || undefined,
        role: UserRole.CREATOR,
        isActive: true,
      });

      user = await userRepo.save(newUser);
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      creatorHandle: user.creatorHandle,
      role: user.role,
      avatarUrl: user.avatarUrl,
      tiktokOpenId: user.tiktokOpenId,
      tiktokUsername: user.tiktokUsername,
    };

    const token = signSessionToken(sessionUser);

    const redirectResponse = NextResponse.redirect(`${baseUrl}/dashboard/products`);
    redirectResponse.cookies.set('backoffice_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return redirectResponse;
  } catch (err: any) {
    console.error('[TIKTOK_CALLBACK_EXCEPTION]', err);
    const target = mode === 'link'
      ? `${baseUrl}/dashboard/settings?error=server_error`
      : `${baseUrl}/?error=server_error`;
    return NextResponse.redirect(target);
  }
}
