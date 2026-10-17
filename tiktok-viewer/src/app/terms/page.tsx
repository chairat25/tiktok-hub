import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export const metadata = {
  title: 'ข้อกำหนดและเงื่อนไขการใช้งาน (Terms of Service) - Showcase Catalog Hub',
};

export default function TermsPage() {
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
        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-tiktok-red">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">ข้อกำหนดและเงื่อนไขการใช้งาน</h1>
          <p className="text-xs text-neutral-400">Terms of Service - ปรับปรุงล่าสุด 18 ตุลาคม 2026</p>
        </div>
      </div>

      <div className="space-y-6 text-xs leading-relaxed text-neutral-300">
        <section>
          <h2 className="text-sm font-semibold text-white mb-2">1. บทนำและการยอมรับข้อตกลง</h2>
          <p>
            ยินดีต้อนรับสู่ Showcase Catalog Hub บริการนี้จัดทำขึ้นเพื่อให้ครีเอเตอร์รวบรวมรายการสินค้าและคลิปวิดีโอรีวิวเพื่อจัดแสดงแก่ผู้ติดตาม การเข้าใช้งานหรือเข้าสู่ระบบผ่านบัญชี TikTok ถือว่าท่านยอมรับข้อตกลงและเงื่อนไขนี้อย่างสมบูรณ์
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">2. การเข้าสู่ระบบและการใช้งานข้อมูล</h2>
          <p>
            การเข้าสู่ระบบผ่าน TikTok Login Kit มีวัตถุประสงค์เพื่ออำนวยความสะดวกในการยืนยันตัวตนก่อนการสั่งซื้อสินค้า ระบบจะเข้าถึงเฉพาะข้อมูลสาธารณะพื้นฐานที่ท่านได้ยินยอม (เช่น ชื่อแสดงผล และรูปโปรไฟล์) โดยไม่มีการเข้าถึงรหัสผ่านหรือส่งข้อความในนามของท่าน
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">3. ลิงก์ไปยังบริการภายนอก (TikTok Shop & Third-Party)</h2>
          <p>
            เว็บไซต์นี้ทำหน้าที่เป็นแคตตาล็อกแนะนำสินค้าและส่งต่อไปยังหน้าร้านค้าทางการบน TikTok Shop หรือแพลตฟอร์มพันธมิตร การสั่งซื้อ การชำระเงิน การจัดส่ง และการรับประกันสินค้าจะเป็นไปตามนโยบายของ TikTok Shop โดยตรง
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">4. ทรัพย์สินทางปัญญา</h2>
          <p>
            คลิปวิดีโอ เครื่องหมายการค้า และเนื้อหาจาก TikTok ที่ปรากฏในบริการนี้เป็นกรรมสิทธิ์ของผู้สร้างเนื้อหาและแพลตฟอร์ม TikTok ระบบใช้การแสดงผลผ่าน TikTok Embed API ตามมาตรฐานสากล
          </p>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-white mb-2">5. การติดต่อเรา</h2>
          <p>
            หากมีข้อสงสัยเกี่ยวกับข้อกำหนดการใช้งาน สามารถติดต่อผู้ดูแลระบบได้ผ่านช่องทางโปรไฟล์ครีเอเตอร์
          </p>
        </section>
      </div>
    </div>
  );
}
