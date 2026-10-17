import { NextRequest, NextResponse } from 'next/server';
import { signSessionToken } from '@tiktok/auth';
import { UserRole } from '@tiktok/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, role = UserRole.CREATOR, provider = 'Google SSO' } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุอีเมล' },
        { status: 400 }
      );
    }

    const user = {
      id: `creator_${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      creatorHandle: `@${email.split('@')[0]}`,
      role: role as UserRole,
    };

    const token = signSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: `เข้าสู่ระบบ Backoffice สำเร็จผ่าน ${provider}`,
      session: {
        user,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    response.cookies.set('backoffice_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
