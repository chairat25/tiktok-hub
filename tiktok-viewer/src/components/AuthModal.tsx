'use client';

import React from 'react';
import { X, ShieldCheck, ArrowRight } from 'lucide-react';
import { IProduct } from '@tiktok/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: IProduct | null;
  /** Same-origin path to land on after TikTok login, e.g. the current storefront. */
  returnTo: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, product, returnTo }) => {
  if (!isOpen || !product) return null;

  const loginHref = `/api/auth/tiktok/authorize?returnTo=${encodeURIComponent(returnTo)}`;

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

        {/* TikTok Login Kit (OAuth) */}
        <a
          href={loginHref}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-neutral-100 text-neutral-900 rounded-xl text-xs font-bold transition-all"
        >
          <ArrowRight className="w-4 h-4" />
          <span>เข้าสู่ระบบด้วยบัญชี TikTok</span>
        </a>
        <p className="mt-3 text-[11px] text-neutral-500 text-center leading-relaxed">
          ระบบจะพาไปยืนยันตัวตนที่ TikTok และไม่มีการเข้าถึงรหัสผ่านของคุณ
        </p>
      </div>
    </div>
  );
};
