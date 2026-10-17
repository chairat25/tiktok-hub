'use client';

import React from 'react';
import { LayoutGrid } from 'lucide-react';
import { ICategory } from '@tiktok/types';

interface CategoryFilterProps {
  categories: ICategory[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  return (
    <div className="w-full px-4 py-3 sticky top-0 bg-neutral-900/95 backdrop-blur-md z-20 border-b border-tiktok-border">
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
            activeCategoryId === null
              ? 'bg-tiktok-red text-white shadow-md shadow-tiktok-red/30'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>ทั้งหมด</span>
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeCategoryId === cat.id
                ? 'bg-tiktok-red text-white shadow-md shadow-tiktok-red/30'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }`}
          >
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
