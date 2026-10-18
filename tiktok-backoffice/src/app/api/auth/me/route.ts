import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@tiktok/auth';
import { getDataSource, User } from '@tiktok/database';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('backoffice_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const sessionUser = verifySessionToken(token);
  if (!sessionUser) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);
    const dbUser = await userRepo.findOne({
      where: { id: sessionUser.id },
    });

    if (!dbUser || !dbUser.isActive) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const user = {
      id: dbUser.id,
      email: dbUser.email,
      displayName: dbUser.displayName,
      creatorHandle: dbUser.creatorHandle,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
      tiktokShopUrl: dbUser.tiktokShopUrl,
      tiktokOpenId: dbUser.tiktokOpenId,
      tiktokUsername: dbUser.tiktokUsername,
      tiktokAvatarUrl: dbUser.tiktokAvatarUrl,
      isTikTokLinked: Boolean(dbUser.tiktokOpenId),
    };

    return NextResponse.json({ authenticated: true, user });
  } catch (err) {
    // Fallback to session user if DB temporarily unreachable
    return NextResponse.json({
      authenticated: true,
      user: {
        ...sessionUser,
        isTikTokLinked: Boolean(sessionUser.tiktokOpenId),
      },
    });
  }
}
