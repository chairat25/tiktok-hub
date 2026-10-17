'use client';

import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, UserCheck, Key, Lock } from 'lucide-react';
import { UserRole } from '@tiktok/types';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedAt: string;
}

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Pond Creator', email: 'pond@tiktok.com', role: UserRole.CREATOR, assignedAt: '2026-10-17' },
  { id: '2', name: 'Staff Support A', email: 'staff1@tiktok.com', role: UserRole.STAFF, assignedAt: '2026-10-17' },
  { id: '3', name: 'Super Administrator', email: 'admin@tiktok.com', role: UserRole.SUPER_ADMIN, assignedAt: '2026-10-17' },
];

export default function TeamRBACPage() {
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.STAFF);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      assignedAt: new Date().toISOString().split('T')[0],
    };

    setTeam([...team, newMember]);
    setInviteEmail('');
    setInviteName('');
    setIsInviteOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-500" />
            <span>จัดการทีมงาน & สิทธิ์การเข้าถึง (Team & RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            กำหนดบทบาทและสิทธิ์ของทีมงานที่สามารถเข้าจัดการสินค้าใน Backoffice ได้
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสมาชิกทีมใหม่</span>
        </button>
      </div>

      {/* Permission Matrix Explanation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-amber-400" />
          <span>ตารางแจกแจงสิทธิ์ตามบทบาท (RBAC Permission Matrix)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-2.5 px-3">สิทธิ์การดำเนินการ (Permissions)</th>
                <th className="py-2.5 px-3 text-center">SUPER_ADMIN</th>
                <th className="py-2.5 px-3 text-center">CREATOR</th>
                <th className="py-2.5 px-3 text-center">STAFF</th>
                <th className="py-2.5 px-3 text-center">VIEWER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium">ดูสินค้าหน้าร้าน (View Products)</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">เพิ่ม/แก้ไขสินค้าและคลิปรีวิว (Manage Products)</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-bold">ไม่อนุมัติ</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">จัดหมวดหมู่สินค้า (Manage Categories)</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-bold">ไม่อนุมัติ</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">เปลี่ยนลิงก์ TikTok Shop ร้านค้า (Manage Shop URL)</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-bold">ไม่อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-bold">ไม่อนุมัติ</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">จัดการสิทธิ์สมาชิกทีม (Manage Staff & RBAC)</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-bold">ไม่อนุมัติ</td>
                <td className="py-2.5 px-3 text-center text-slate-500 font-bold">ไม่อนุมัติ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Members List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
            <tr>
              <th className="py-3.5 px-4">ชื่อสมาชิกทีม</th>
              <th className="py-3.5 px-4">อีเมล</th>
              <th className="py-3.5 px-4">บทบาท (Role)</th>
              <th className="py-3.5 px-4">วันที่เพิ่มเข้าระบบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-semibold text-white">
                  {member.name}
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  {member.email}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    member.role === UserRole.SUPER_ADMIN
                      ? 'bg-purple-950/60 border-purple-800 text-purple-400'
                      : member.role === UserRole.CREATOR
                      ? 'bg-blue-950/60 border-blue-800 text-blue-400'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  {member.assignedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-left">
            <h3 className="text-sm font-bold text-white mb-4">เพิ่มสมาชิกทีมเข้าสู่ระบบ</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อสมาชิก *
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  อีเมล *
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="somchai@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  บทบาท (Role)
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={UserRole.STAFF}>STAFF (จัดการสินค้าและหมวดหมู่)</option>
                  <option value={UserRole.CREATOR}>CREATOR (เจ้าของร้าน/ตั้งค่าร้านค้าได้)</option>
                  <option value={UserRole.SUPER_ADMIN}>SUPER_ADMIN (ดูแลระบบทั้งหมด)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  เพิ่มสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
