import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'นโยบายความเป็นส่วนตัว (Privacy Policy) - Showcase Catalog Hub',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 p-6 max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับสู่หน้าร้าน</span>
      </Link>

      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-800">
        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-tiktok-cyan">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">นโยบายความเป็นส่วนตัว</h1>
          <p className="text-xs text-neutral-400">Privacy Policy - ปรับปรุงล่าสุด 18 ตุลาคม 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-neutral-300">
        <section>
          <h2 className="text-sm font-semibold text-white mb-2">1. ข้อมูลที่เราเก็บรวบรวม</h2>
          <p className="mb-2">
            Showcase Catalog Hub ให้ความสำคัญสูงสุดต่อการคุ้มครองข้อมูลส่วนบุคคล เมื่อท่านเข้าใช้งานหรือยืนยันตัวตนด้วย TikTok Login Kit ข้อมูลที่เรารวบรวมมีดังนี้:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-400">
            <li>ข้อมูลบัญชีพื้นฐานจาก TikTok: หมายเลขระบุตัวตน (Open ID), ชื่อแสดงผล (Display Name), และรูปโปรไฟล์ (Avatar URL)</li>
            <li>ข้อมูลการใช้งานทางเทคนิค: สถิติการคลิกลิงก์สินค้า (Click Tracking), วันเวลาที่คลิก, และข้อมูลเบราว์เซอร์</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">2. วัตถุประสงค์ในการใช้ข้อมูล</h2>
          <p>
            เราใช้ข้อมูลเพื่อระบุสถานะการเข้าสู่ระบบ บันทึกประวัติการแนะนำสินค้าเพื่อส่งต่อไปยังร้านค้า TikTok Shop ที่ถูกต้อง และปรับปรุงประสิทธิภาพการแสดงผลสินค้าในแคตตาล็อกให้ตรงตามความสนใจ
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">3. คุกกี้และเทคโนโลยีการจัดเก็บข้อมูล (Cookies)</h2>
          <p>
            เราใช้ HttpOnly Secure Cookies สำหรับเก็บเซสชัน (Session) การเข้าสู่ระบบ เพื่อความปลอดภัยจากการถูกดักข้อมูล และป้องกันการโจมตีทางไซเบอร์
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">4. การลบและการถอนความยินยอม (Data Deletion)</h2>
          <p>
            ท่านมีสิทธิ์ขอลบข้อมูลบัญชีและประวัติการเข้าสู่ระบบของท่านได้ทุกเมื่อ โดยสามารถยกเลิกการเชื่อมต่อผ่านการตั้งค่าบัญชี TikTok ของท่าน หรือติดต่อผู้ดูแลระบบเพื่อลบข้อมูลออกจากฐานข้อมูลอย่างถาวร
          </p>
        </section>
      </div>
    </div>
  );
}
