'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  FolderTree,
  Settings,
  Users,
  LogOut,
  ExternalLink,
  ShoppingBag,
  ShieldAlert,
} from 'lucide-react';
import { PermissionAction } from '@tiktok/types';
import { hasPermission } from '@tiktok/auth/rbac';
import { PublicUserView, apiRequest } from '@tiktok/server/client';

interface SidebarProps {
  currentUser: PublicUserView | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
    }
  };

  const navItems = [
    {
      name: 'จัดการสินค้า',
      href: '/dashboard/products',
      icon: Package,
      permission: PermissionAction.VIEW_PRODUCTS,
    },
    {
      name: 'จัดหมวดหมู่สินค้า',
      href: '/dashboard/categories',
      icon: FolderTree,
      permission: PermissionAction.MANAGE_CATEGORIES,
    },
    {
      name: 'ตั้งค่าร้าน & ลิงก์ TikTok',
      href: '/dashboard/settings',
      icon: Settings,
      permission: PermissionAction.MANAGE_SHOP_SETTINGS,
    },
    {
      name: 'ทีมงาน & สิทธิ์ (RBAC)',
      href: '/dashboard/team',
      icon: Users,
      permission: PermissionAction.MANAGE_STAFF,
    },
  ].filter((item) => currentUser && hasPermission(currentUser.role, item.permission));

  const creatorHandle = currentUser?.creatorHandle || '@pond';
  const baseViewerUrl = process.env.NEXT_PUBLIC_VIEWER_URL || 'https://tiktok-hub-six.vercel.app';
  const viewerUrl = `${baseViewerUrl.replace(/\/$/, '')}/${creatorHandle.replace(/^@/, '')}`;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                TikTok Hub
              </h2>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Backoffice Portal
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Viewer Link */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        {/* View Storefront Link */}
        <a
          href={viewerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-medium transition-all group"
        >
          <div className="flex items-center gap-2 truncate">
            <ShoppingBag className="w-4 h-4 text-rose-400" />
            <span className="truncate">หน้าร้าน TikTok Viewer</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* User Card */}
        <div className="flex items-center justify-between pt-1">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-white truncate">
              {currentUser?.displayName || 'Creator Admin'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser?.email || 'creator@tiktok.com'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                {currentUser?.role || 'CREATOR'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
