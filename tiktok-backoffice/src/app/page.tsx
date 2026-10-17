'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { UserRole } from '@tiktok/types';

export default function BackofficeLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CREATOR);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (provider: string) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const loginEmail = email || (role === UserRole.SUPER_ADMIN ? 'admin@tiktok.com' : 'pond_creator@tiktok.com');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          displayName: role === UserRole.SUPER_ADMIN ? 'Super Administrator' : 'Pond Creator',
          role,
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      router.push('/dashboard/products');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
        {/* Brand Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
            <ShoppingBag className="w-7 h-7" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white tracking-wide">
            TikTok Catalog Backoffice
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            ระบบบริหารจัดการสินค้า ลิงก์ TikTok Shop และสิทธิ์ทีมงาน (SSO & RBAC)
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Role Selector */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            เลือกประเภทบทบาทการเข้าใช้งาน (Role)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole(UserRole.CREATOR)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                role === UserRole.CREATOR
                  ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Creator / เจ้าของร้าน
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.SUPER_ADMIN)}
              className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                role === UserRole.SUPER_ADMIN
                  ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-semibold'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Super Admin
            </button>
          </div>
        </div>

        {/* Quick SSO Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleLogin('Google SSO')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
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

          <button
            onClick={() => handleLogin('TikTok OAuth')}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
          >
            <ArrowRight className="w-4 h-4 text-rose-400" />
            <span>เข้าสู่ระบบด้วย TikTok Account</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[11px] text-slate-500">หรือใช้อีเมลทีมงาน</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Email Input */}
        <div className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ (เช่น pond@tiktok.com)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            onClick={() => handleLogin('Email Auth')}
            disabled={isLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            เข้าสู่ระบบ Backoffice
          </button>
        </div>
      </div>
    </div>
  );
}
