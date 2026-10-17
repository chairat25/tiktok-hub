'use client';

import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  X,
} from 'lucide-react';
import { ICategory } from '@tiktok/types';

const INITIAL_CATEGORIES: ICategory[] = [
  { id: 'cat-1', creatorId: 'c1', name: 'สกินแคร์ & บิวตี้', slug: 'beauty', sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', creatorId: 'c1', name: 'อุปกรณ์ไอที & แกดเจ็ต', slug: 'tech', sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-3', creatorId: 'c1', name: 'ของใช้ในบ้าน', slug: 'home', sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-4', creatorId: 'c1', name: 'แฟชั่น & เครื่องแต่งกาย', slug: 'fashion', sortOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ICategory[]>(INITIAL_CATEGORIES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // update sort orders
    updated.forEach((c, idx) => {
      c.sortOrder = idx + 1;
    });

    setCategories(updated);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;

    const newCategory: ICategory = {
      id: `cat-${Date.now()}`,
      creatorId: 'c1',
      name: newCatName,
      slug: newCatSlug,
      sortOrder: categories.length + 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCategories([...categories, newCategory]);
    setNewCatName('');
    setNewCatSlug('');
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('ต้องการลบหมวดหมู่นี้หรือไม่? สินค้าในหมวดนี้จะถูกย้ายเป็นหมวดทั่วไป')) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-blue-500" />
            <span>จัดหมวดหมู่สินค้า (Categories & Sorting)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            จัดเรียงลำดับแถบหมวดหมู่ที่จะไปแสดงผลในหน้าร้าน TikTok Viewer
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มหมวดหมู่ใหม่</span>
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-20 text-center">ลำดับ</th>
              <th className="py-3.5 px-4">ชื่อหมวดหมู่</th>
              <th className="py-3.5 px-4">URL Slug</th>
              <th className="py-3.5 px-4 text-center">สถานะแสดงผล</th>
              <th className="py-3.5 px-4 text-right">การจัดลำดับ & จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {categories.map((cat, index) => (
              <tr key={cat.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                  {index + 1}
                </td>

                <td className="py-3.5 px-4 font-semibold text-white">
                  {cat.name}
                </td>

                <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                  /{cat.slug}
                </td>

                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => toggleActive(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                      cat.isActive
                        ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-400'
                        : 'bg-slate-800 border border-slate-700 text-slate-500'
                    }`}
                  >
                    {cat.isActive ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>เปิดใช้งาน</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-500" />
                        <span>ปิดใช้งาน</span>
                      </>
                    )}
                  </button>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Move Up */}
                    <button
                      disabled={index === 0}
                      onClick={() => moveCategory(index, 'up')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>

                    {/* Move Down */}
                    <button
                      disabled={index === categories.length - 1}
                      onClick={() => moveCategory(index, 'down')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      title="เลื่อนลง"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors ml-2"
                      title="ลบหมวดหมู่"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-500" />
                <span>เพิ่มหมวดหมู่ใหม่</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อหมวดหมู่ *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="เช่น สัตว์เลี้ยง & อาหารสัตว์"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  placeholder="pets"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white"
                >
                  บันทึกหมวดหมู่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
