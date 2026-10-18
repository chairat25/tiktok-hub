import { NextRequest, NextResponse } from 'next/server';
import { getDataSource, User } from '@tiktok/database';
import { hashPassword, signSessionToken } from '@tiktok/auth';
import { UserRole } from '@tiktok/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { email, password, displayName, creatorHandle } = body;

    email = email?.trim().toLowerCase();
    password = password?.trim();
    displayName = displayName?.trim();
    creatorHandle = creatorHandle?.trim();

    if (!email || !password || !displayName || !creatorHandle) {
      return NextResponse.json(
        { success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' },
        { status: 400 }
      );
    }

    // Ensure handle starts with @
    const formattedHandle = creatorHandle.startsWith('@') ? creatorHandle : `@${creatorHandle}`;

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    // Check existing email or handle
    const existingUser = await userRepo.findOne({
      where: [{ email }, { creatorHandle: formattedHandle }],
    });

    if (existingUser) {
      const isEmailConflict = existingUser.email === email;
      return NextResponse.json(
        {
          success: false,
          message: isEmailConflict
            ? 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว กรุณาเข้าสู่ระบบ'
            : `TikTok Handle "${formattedHandle}" ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น`,
        },
        { status: 400 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const newUser = userRepo.create({
      email,
      passwordHash,
      displayName,
      creatorHandle: formattedHandle,
      role: UserRole.CREATOR,
      isActive: true,
    });

    const savedUser = await userRepo.save(newUser);

    const sessionUser = {
      id: savedUser.id,
      email: savedUser.email,
      displayName: savedUser.displayName,
      creatorHandle: savedUser.creatorHandle,
      role: savedUser.role,
      avatarUrl: savedUser.avatarUrl,
    };

    const token = signSessionToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      message: 'สมัครสมาชิกร้านค้าสำเร็จ ยินดีต้อนรับสู่ TikTok Showcase!',
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
    console.error('[AUTH_REGISTER_ERROR]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' },
      { status: 500 }
    );
  }
}
