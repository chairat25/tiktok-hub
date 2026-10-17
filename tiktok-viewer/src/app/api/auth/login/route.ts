import { NextRequest, NextResponse } from 'next/server';
import { signSessionToken } from '@tiktok/auth';
import { UserRole } from '@tiktok/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, provider } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุอีเมล' },
        { status: 400 }
      );
    }

    // Standard session user object
    const user = {
      id: `usr_${Date.now()}`,
      email,
      displayName: displayName || email.split('@')[0],
      role: UserRole.VIEWER,
    };

    const token = signSessionToken(user);

    const response = NextResponse.json({
      success: true,
      message: `เข้าสู่ระบบสำเร็จผ่าน ${provider || 'Email'}`,
      session: {
        user,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set('tiktok_session', token, {
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
