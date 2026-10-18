import { NextRequest, NextResponse } from 'next/server';
import { getDataSource, User } from '@tiktok/database';
import { verifyPassword, signSessionToken } from '@tiktok/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { email, password } = body;

    email = email?.trim().toLowerCase();
    password = password?.trim();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' },
        { status: 400 }
      );
    }

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    const user = await userRepo.findOne({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: 'บัญชีนี้ผูกไว้กับ TikTok Account กรุณาเข้าสู่ระบบด้วยปุ่ม TikTok',
        },
        { status: 400 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 403 }
      );
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

    const response = NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      session: {
        user: sessionUser,
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
    console.error('[AUTH_LOGIN_ERROR]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' },
      { status: 500 }
    );
  }
}
