import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json(
      { success: false, message: 'กรุณาระบุ URL ของคลิป TikTok' },
      { status: 400 }
    );
  }

  try {
    // Call official TikTok oEmbed API (No API key required)
    const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(oembedEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: 'ไม่สามารถดึงข้อมูลคลิป TikTok ได้ กรุณาตรวจสอบลิงก์' },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json({
      success: true,
      data: {
        title: data.title || '',
        thumbnailUrl: data.thumbnail_url || '',
        authorName: data.author_name || '',
        authorUrl: data.author_url || '',
        html: data.html || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ TikTok oEmbed' },
      { status: 500 }
    );
  }
}
