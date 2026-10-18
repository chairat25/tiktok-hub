import { NextRequest, NextResponse } from 'next/server';
import { getDataSource, User } from '@tiktok/database';
import { verifySessionToken } from '@tiktok/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('backoffice_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const sessionUser = verifySessionToken(sessionToken);
    if (!sessionUser) {
      return NextResponse.json({ success: false, message: 'Session หมดอายุ' }, { status: 401 });
    }

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    const user = await userRepo.findOne({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'ไม่พบบัญชีผู้ใช้' }, { status: 404 });
    }

    // Safety: ensure user has a password before unlinking, so they don't lock themselves out
    if (!user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          message: 'ไม่สามารถยกเลิกการเชื่อมต่อได้ เนื่องจากคุณยังไม่ได้ตั้งรหัสผ่านสำหรับเข้าสู่ระบบด้วยอีเมล',
        },
        { status: 400 }
      );
    }

    await userRepo.update(user.id, {
      tiktokOpenId: undefined,
      tiktokUsername: undefined,
      tiktokAvatarUrl: undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'ยกเลิกการเชื่อมต่อกับบัญชี TikTok เรียบร้อยแล้ว',
    });
  } catch (err: any) {
    console.error('[TIKTOK_UNLINK_ERROR]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'เกิดข้อผิดพลาดในการยกเลิกเชื่อมต่อ' },
      { status: 500 }
    );
  }
}
