import { NextRequest, NextResponse } from 'next/server';
import { getDataSource, User } from '@tiktok/database';
import { verifySessionToken } from '@tiktok/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get('backoffice_session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ success: false, message: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });
    }

    const sessionUser = verifySessionToken(sessionToken);
    if (!sessionUser) {
      return NextResponse.json({ success: false, message: 'Session หมดอายุ' }, { status: 401 });
    }

    const body = await req.json();
    let { displayName, creatorHandle, tiktokShopUrl, avatarUrl } = body;

    displayName = displayName?.trim();
    creatorHandle = creatorHandle?.trim();
    if (creatorHandle && !creatorHandle.startsWith('@')) {
      creatorHandle = `@${creatorHandle}`;
    }

    const ds = await getDataSource();
    const userRepo = ds.getRepository(User);

    // If handle changed, verify uniqueness
    if (creatorHandle) {
      const existing = await userRepo.findOne({
        where: { creatorHandle },
      });
      if (existing && existing.id !== sessionUser.id) {
        return NextResponse.json(
          { success: false, message: `Handle ${creatorHandle} มีผู้ใช้งานแล้ว` },
          { status: 400 }
        );
      }
    }

    await userRepo.update(sessionUser.id, {
      ...(displayName ? { displayName } : {}),
      ...(creatorHandle ? { creatorHandle } : {}),
      ...(tiktokShopUrl !== undefined ? { tiktokShopUrl } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    });

    const updatedUser = await userRepo.findOne({
      where: { id: sessionUser.id },
    });

    return NextResponse.json({
      success: true,
      message: 'บันทึกข้อมูลการตั้งค่าร้านค้าเรียบร้อยแล้ว',
      user: updatedUser,
    });
  } catch (err: any) {
    console.error('[SETTINGS_UPDATE_ERROR]', err);
    return NextResponse.json(
      { success: false, message: err.message || 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า' },
      { status: 500 }
    );
  }
}
