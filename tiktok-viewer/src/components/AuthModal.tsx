'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { IProduct } from '@tiktok/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
  onLoginSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  product,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !product) return null;

  const handleQuickLogin = async (provider: 'google' | 'tiktok' | 'email') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: email || `user_${Date.now()}@example.com`,
          displayName: displayName || 'ผู้เข้าชม TikTok',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      onLoginSuccess(data.session?.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 text-tiktok-red mb-3">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-semibold tracking-wider uppercase">
            ยืนยันตัวตนก่อนสั่งซื้อ
          </span>
        </div>

        <h2 className="text-lg font-bold text-white mb-1.5">
          เข้าสู่ระบบเพื่อซื้อสินค้า
        </h2>
        <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
          เข้าสู่ระบบเพื่อบันทึกประวัติการสั่งซื้อ และรับสิทธิประโยชน์จากร้านค้าของ Creator
        </p>

        {/* Target Product Summary */}
        <div className="flex items-center gap-3 p-3 bg-neutral-800/80 rounded-xl mb-5 border border-neutral-700/60">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-11 h-11 rounded-lg object-cover bg-neutral-900 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{product.title}</p>
            <p className="text-xs font-bold text-tiktok-red">
              ฿{(product.discountPrice || product.price).toLocaleString()}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* SSO Action Buttons */}
        <div className="space-y-2.5">
          {/* Google SSO */}
          <button
            onClick={() => handleQuickLogin('google')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>เข้าสู่ระบบด้วย Google SSO</span>
          </button>

          {/* TikTok SSO */}
          <button
            onClick={() => handleQuickLogin('tiktok')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold border border-neutral-700 transition-all disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4 text-tiktok-cyan" />
            <span>เข้าสู่ระบบด้วยบัญชี TikTok</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-[11px] text-neutral-500">หรือใช้อีเมลทั่วไป</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {/* Email Fast Login */}
        <div className="space-y-2">
          <div className="relative">
            <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-tiktok-red transition-colors"
            />
          </div>
          <button
            onClick={() => handleQuickLogin('email')}
            disabled={isLoading || !email}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl text-xs font-medium border border-neutral-700 transition-all disabled:opacity-40"
          >
            เข้าใช้งานด้วยอีเมล
          </button>
        </div>
      </div>
    </div>
  );
};
