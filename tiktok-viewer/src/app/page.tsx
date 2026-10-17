'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-tiktok-red mb-4 shadow-xl shadow-tiktok-red/10">
        <ShoppingBag className="w-8 h-8" />
      </div>

      <h1 className="text-xl font-bold text-white mb-2">
        TikTok Catalog Showcase
      </h1>
      <p className="text-xs text-neutral-400 max-w-xs mb-8 leading-relaxed">
        ระบบรวบรวมสินค้าและคลิปรีวิว สำหรับติดลิงก์ใน TikTok Bio แยกตามหมวดหมู่และเจ้าของร้าน
      </p>

      <div className="w-full space-y-3">
        <Link
          href="/@pond"
          className="w-full py-3 px-4 bg-tiktok-red hover:bg-tiktok-red/90 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-tiktok-red/25 transition-all"
        >
          <span>เข้าชมตัวอย่างร้านค้า (@pond)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <a
          href="http://localhost:3001"
          className="w-full py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-neutral-700 transition-all"
        >
          <span>เข้าสู่ระบบหลังบ้าน (TikTok Backoffice)</span>
        </a>
      </div>
    </div>
  );
}
