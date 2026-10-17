import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@tiktok/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, creatorId, targetUrl } = body;

    // Check if viewer is authenticated
    const token = req.cookies.get('tiktok_session')?.value;
    const sessionUser = token ? verifySessionToken(token) : null;

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, requireAuth: true, message: 'กรุณาเข้าสู่ระบบก่อนทำการซื้อสินค้า' },
        { status: 401 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    // Click event tracking log
    console.log(`[CLICK_TRACKING] Viewer: ${sessionUser.email} -> Product: ${productId} -> Creator: ${creatorId} [${ipAddress}]`);

    return NextResponse.json({
      success: true,
      redirectUrl: targetUrl,
      viewer: sessionUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
