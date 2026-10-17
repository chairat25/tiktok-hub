import { NextRequest, NextResponse } from 'next/server';
import { uploadBufferToR2, cacheRemoteImageToR2, isR2Configured } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Case 1: JSON payload with remoteUrl (Cache remote TikTok image to R2)
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const { remoteUrl } = body;

      if (!remoteUrl) {
        return NextResponse.json(
          { success: false, message: 'กรุณาระบุ remoteUrl' },
          { status: 400 }
        );
      }

      const result = await cacheRemoteImageToR2(remoteUrl);
      return NextResponse.json({
        success: true,
        url: result.url,
        key: result.key,
        source: result.source,
        isR2Configured,
      });
    }

    // Case 2: Direct file upload via FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'กรุณาเลือกไฟล์รูปภาพที่ต้องการอัปโหลด' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await uploadBufferToR2(buffer, file.name, file.type || 'image/jpeg');

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      source: result.source,
      isR2Configured,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' },
      { status: 500 }
    );
  }
}
