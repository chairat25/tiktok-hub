'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Settings,
  Save,
  ShoppingBag,
  Link2,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { MeResponse, PublicUserView, apiRequest, errorMessage, postJson } from '@tiktok/server/client';

const LINK_ERROR_MESSAGES: Record<string, string> = {
  already_linked_other: 'บัญชี TikTok นี้ถูกผูกไว้กับร้านค้าอื่นแล้ว',
  tiktok_denied: 'การเชื่อมต่อ TikTok ถูกยกเลิกหรือไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  unauthorized: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่แล้วลองอีกครั้ง',
  missing_credentials: 'ระบบยังไม่พบคีย์ TikTok Client Credentials',
  rate_limited: 'มีการเรียกใช้งานถี่เกินไป กรุณาลองใหม่ภายหลัง',
  server_error: 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง',
};

function ShopSettingsForm() {
  const searchParams = useSearchParams();

  const [creatorHandle, setCreatorHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tiktokShopUrl, setTiktokShopUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [isTikTokLinked, setIsTikTokLinked] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState<string | null>(null);
  const [tiktokAvatarUrl, setTiktokAvatarUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current user details & handle query params
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await apiRequest<MeResponse>('/api/auth/me');
        if (data.authenticated && data.user) {
          const u = data.user;
          setCreatorHandle(u.creatorHandle || '');
          setDisplayName(u.displayName || '');
          setTiktokShopUrl(u.tiktokShopUrl || '');
          setAvatarUrl(u.avatarUrl || '');
          setIsTikTokLinked(u.isTikTokLinked);
          setTiktokUsername(u.tiktokUsername || null);
          setTiktokAvatarUrl(u.tiktokAvatarUrl || null);
        }
      } catch (err: unknown) {
        setAlertMsg({ type: 'error', text: errorMessage(err, 'ไม่สามารถโหลดข้อมูลบัญชีได้') });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // Check query params from TikTok OAuth redirect
    const linked = searchParams.get('linked');
    const error = searchParams.get('error');
    const linkErrorText = error ? LINK_ERROR_MESSAGES[error] : undefined;

    if (linked === 'success') {
      setAlertMsg({ type: 'success', text: 'เชื่อมต่อกับบัญชี TikTok สำเร็จเรียบร้อยแล้ว!' });
    } else if (linkErrorText) {
      setAlertMsg({ type: 'error', text: linkErrorText });
    }
  }, [searchParams]);

  // Save Shop Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAlertMsg(null);

    try {
      const data = await postJson<{ user: PublicUserView }>(
        '/api/creator/settings',
        { displayName, creatorHandle, tiktokShopUrl, avatarUrl },
        'PUT'
      );
      setCreatorHandle(data.user.creatorHandle || '');

      setAlertMsg({ type: 'success', text: 'บันทึกข้อมูลการตั้งค่าร้านค้าเรียบร้อยแล้ว' });
    } catch (err: unknown) {
      setAlertMsg({ type: 'error', text: errorMessage(err, 'เกิดข้อผิดพลาดในการบันทึก') });
    } finally {
      setIsSaving(false);
    }
  };

  // Start Link TikTok OAuth
  const handleLinkTikTok = () => {
    window.location.href = '/api/auth/tiktok/authorize?mode=link';
  };

  // Unlink TikTok
  const handleUnlinkTikTok = async () => {
    if (!confirm('คุณต้องการยกเลิกการเชื่อมต่อกับบัญชี TikTok ใช่หรือไม่?')) return;

    setIsUnlinking(true);
    setAlertMsg(null);

    try {
      await apiRequest('/api/auth/tiktok/unlink', { method: 'POST' });

      setIsTikTokLinked(false);
      setTiktokUsername(null);
      setTiktokAvatarUrl(null);
      setAlertMsg({ type: 'success', text: 'ยกเลิกการเชื่อมต่อกับบัญชี TikTok เรียบร้อยแล้ว' });
    } catch (err: unknown) {
      setAlertMsg({ type: 'error', text: errorMessage(err, 'เกิดข้อผิดพลาดในการยกเลิกเชื่อมต่อ') });
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>กำลังโหลดการตั้งค่า...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-500" />
          <span>ตั้งค่าร้านค้า & บัญชีผู้ใช้ (Shop & Account Settings)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          จัดการข้อมูลหน้าร้าน ลิงก์ TikTok Shop และผูกบัญชีเพื่อเข้าสู่ระบบด้วย TikTok
        </p>
      </div>

      {/* Alert Messages */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* TikTok Account Linking Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">การเชื่อมต่อบัญชี TikTok (TikTok Account Linking)</h2>
              <p className="text-[11px] text-slate-400">ผูกบัญชีเพื่อใช้ปุ่ม "เข้าสู่ระบบด้วย TikTok Account" ได้ทันที</p>
            </div>
          </div>

          <div>
            {isTikTokLinked ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                เชื่อมต่อแล้ว
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 border border-amber-800 text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
                ยังไม่ได้เชื่อมต่อ
              </span>
            )}
          </div>
        </div>

        {isTikTokLinked ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              {tiktokAvatarUrl ? (
                <img
                  src={tiktokAvatarUrl}
                  alt="TikTok Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs">
                  TT
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-white">{tiktokUsername || 'บัญชี TikTok ที่ผูกไว้'}</p>
                <p className="text-[11px] text-emerald-400">สามารถกดเข้าสู่ระบบด้วย TikTok SSO ได้ทันที</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUnlinkTikTok}
              disabled={isUnlinking}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-800/60 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isUnlinking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              <span>ยกเลิกการเชื่อมต่อ</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="space-y-1">
              <p className="text-xs text-slate-300">
                เมื่อผูกบัญชีเสร็จแล้ว คุณจะสามารถคลิกเข้าสู่ระบบ Backoffice ผ่านบัญชี TikTok ได้ทันทีโดยไม่ต้องจำรหัสผ่าน
              </p>
              <p className="text-[11px] text-slate-500">
                รองรับทั้งบัญชีทดสอบระหว่างรอ Review และบัญชีจริงเมื่อระบบผ่านการอนุมัติ
              </p>
            </div>

            <button
              type="button"
              onClick={handleLinkTikTok}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-white/10"
            >
              <Link2 className="w-4 h-4 text-rose-500" />
              <span>เชื่อมต่อกับ TikTok</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
            <ShoppingBag className="w-4 h-4 text-blue-500" />
            <span>ข้อมูลหน้าร้านค้าบน TikTok Viewer</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ชื่อร้านค้า / แบรนด์ (Display Title) *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                TikTok Handle (URL Path ร้านค้า) *
              </label>
              <input
                type="text"
                required
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                หน้าร้านค้า: <a href={`https://tiktok-hub-six.vercel.app/${creatorHandle}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">https://tiktok-hub-six.vercel.app/{creatorHandle} <ExternalLink className="w-2.5 h-2.5" /></a>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์ร้านค้าหลักใน TikTok (TikTok Shop URL / Showcase URL)
            </label>
            <input
              type="url"
              value={tiktokShopUrl}
              onChange={(e) => setTiktokShopUrl(e.target.value)}
              placeholder="https://shop.tiktok.com/view/product/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์รูปภาพโปรไฟล์ร้านค้า (Avatar Image URL)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>บันทึกข้อมูลหน้าร้าน</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ShopSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>กำลังโหลดการตั้งค่า...</span>
        </div>
      }
    >
      <ShopSettingsForm />
    </Suspense>
  );
}
