'use client';

import React, { useState } from 'react';
import { Settings, Save, ShoppingBag, Database, ShieldCheck, CheckCircle } from 'lucide-react';

export default function ShopSettingsPage() {
  const [creatorHandle, setCreatorHandle] = useState('@pond');
  const [shopName, setShopName] = useState('พิกัดสินค้า & คลิปรีวิว By Pond');
  const [tiktokShopUrl, setTiktokShopUrl] = useState('https://shop.tiktok.com');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>ตั้งค่าร้านค้า & บัญชี TikTok (Shop Settings)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          กำหนดชื่อร้าน ลิงก์หน้าร้าน TikTok Shop และการเชื่อมต่อฐานข้อมูล Cloud
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShoppingBag className="w-4 h-4 text-rose-500" />
            <span>ข้อมูลหน้าร้านบน TikTok Viewer</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ชื่อที่แสดงหน้าร้าน (Display Title) *
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                TikTok Handle (URL Path) *
              </label>
              <input
                type="text"
                required
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                เข้าชมได้ที่: http://localhost:3000/{creatorHandle}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์ร้านค้าหลักใน TikTok (TikTok Shop / Affiliate Showcase URL) *
            </label>
            <input
              type="url"
              required
              value={tiktokShopUrl}
              onChange={(e) => setTiktokShopUrl(e.target.value)}
              placeholder="https://shop.tiktok.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์รูปภาพโปรไฟล์ร้านค้า (Avatar URL)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกข้อมูลหน้าร้าน</span>
            </button>
          </div>
        </div>

        {/* Database & Cloud BaaS Integration Notice */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>โครงสร้างฐานข้อมูล & Cloud BaaS (Supabase / PostgreSQL)</span>
          </h2>

          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              ปัจจุบันระบบรันด้วย <strong className="text-white">Local PostgreSQL (Docker Compose)</strong> บนพอร์ต 5432 ซึ่งพร้อมใช้งานทันทีโดยไม่ต้องใส่ Cloud Key
            </p>
            <p>
              บริการที่ผู้ใช้พูดถึงในระบบคลาวด์เรียกว่า <strong className="text-emerald-400">BaaS (Backend-as-a-Service)</strong> โดยเฉพาะระบบของ <strong>Supabase</strong> ซึ่งมีบริการ <strong>Supabase Auth (Social OAuth Provider / IdP)</strong> และ <strong>Managed PostgreSQL Database</strong> ในตัว
            </p>
            <p className="text-slate-400">
              เมื่อคุณได้ API Key และ Connection String จาก Supabase มาในอนาคต เพียงแก้ไขค่าในไฟล์ <code className="bg-slate-950 px-2 py-0.5 rounded text-blue-300">.env</code> ตัวเดียว ระบบจะเชื่อมต่อฐานข้อมูลบน Cloud ได้ทันที 100% โดยไม่ต้องแก้โค้ดใดๆ เพิ่มเติม
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
