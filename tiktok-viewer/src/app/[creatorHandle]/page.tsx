'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ExternalLink,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  ShoppingBag,
  Search,
  X,
  PackageOpen,
} from 'lucide-react';
import { ICategory, IProduct, ProductType } from '@tiktok/types';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { AuthModal } from '@/components/AuthModal';
import { VideoModal } from '@/components/VideoModal';

// Sample default data for demonstration & immediate testing
const DEFAULT_CATEGORIES: ICategory[] = [
  { id: 'cat-1', creatorId: 'c1', name: 'สกินแคร์ & บิวตี้', slug: 'beauty', sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', creatorId: 'c1', name: 'อุปกรณ์ไอที & แกดเจ็ต', slug: 'tech', sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-3', creatorId: 'c1', name: 'ของใช้ในบ้าน', slug: 'home', sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-4', creatorId: 'c1', name: 'แฟชั่น & เครื่องแต่งกาย', slug: 'fashion', sortOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const DEFAULT_PRODUCTS: IProduct[] = [
  {
    id: 'prod-1',
    creatorId: 'c1',
    categoryId: 'cat-1',
    title: 'เซรั่มบำรุงผิวหน้าไฮยาลูรอนสูตรเข้มข้น ลดเลือนริ้วรอย กระจ่างใส',
    description: 'สินค้าขายดีติดอันดับ 1 ใน TikTok Shop รีวิวเพียบ ผิวนุ่มชุ่มชื้นตลอดวัน',
    price: 490,
    discountPrice: 350,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
    productType: ProductType.TIKTOK_SHOP,
    tiktokProductUrl: 'https://shop.tiktok.com/view/product/1729482910?region=TH&locale=th-TH',
    tiktokVideoUrl: 'https://www.tiktok.com/@creator/video/7391829182918',
    clickCount: 142,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-2',
    creatorId: 'c1',
    categoryId: 'cat-2',
    title: 'ขาตั้งมือถือปรับหมุน 360 องศา สำหรับไลฟ์สดและถ่ายคลิป TikTok',
    description: 'วัสดุอลูมิเนียม แข็งแรงทนทาน พกพาสะดวก รองรับสมาร์ทโฟนทุกรุ่น',
    price: 299,
    discountPrice: 199,
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
    productType: ProductType.TIKTOK_SHOP,
    tiktokProductUrl: 'https://shop.tiktok.com/view/product/1729482911?region=TH&locale=th-TH',
    tiktokVideoUrl: 'https://www.tiktok.com/@creator/video/7391829182919',
    clickCount: 98,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-3',
    creatorId: 'c1',
    categoryId: 'cat-2',
    title: 'ไมค์ไร้สายไร้เสียงรบกวน ไมค์หนีบปกเสื้อ Type-C และ Lightning',
    description: 'เสียงคมชัดตัดเสียงลม สำหรับคอนเทนต์ครีเอเตอร์ แบตอึด 8 ชั่วโมง',
    price: 890,
    discountPrice: 650,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    productType: ProductType.TIKTOK_SHOP,
    tiktokProductUrl: 'https://shop.tiktok.com/view/product/1729482912?region=TH&locale=th-TH',
    clickCount: 215,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'prod-4',
    creatorId: 'c1',
    categoryId: 'cat-3',
    title: 'แก้วเก็บความเย็นสแตนเลส 304 ขนาด 900ml เก็บอุณหภูมิได้ 24 ชั่วโมง',
    description: 'ฝาเกลียวกันน้ำหก พร้อมหลอดสแตนเลส พกไปทำงานสะดวก',
    price: 390,
    discountPrice: 280,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    productType: ProductType.TIKTOK_SHOP,
    tiktokProductUrl: 'https://shop.tiktok.com/view/product/1729482913?region=TH&locale=th-TH',
    clickCount: 64,
    sortOrder: 4,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function CreatorShowcasePage() {
  const params = useParams();
  const rawHandle = params?.creatorHandle as string;
  const decodedHandle = decodeURIComponent(rawHandle || '@creator');

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<IProduct | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);

  // Check login status on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Filter products by category AND search query
  const filteredProducts = DEFAULT_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategoryId ? p.categoryId === activeCategoryId : true;
    const matchesQuery = searchQuery.trim() === ''
      ? true
      : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  // Handle Buy click
  const handleBuyClick = async (product: IProduct) => {
    if (!currentUser) {
      setSelectedProductForBuy(product);
      setIsAuthModalOpen(true);
      return;
    }

    await executeRedirectToShop(product);
  };

  const executeRedirectToShop = async (product: IProduct) => {
    try {
      const res = await fetch('/api/track-and-buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          creatorId: product.creatorId,
          targetUrl: product.tiktokProductUrl,
        }),
      });

      const data = await res.json();
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      }
    } catch {
      window.open(product.tiktokProductUrl, '_blank');
    }
  };

  const handleLoginSuccess = async (user: any) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);

    if (selectedProductForBuy) {
      await executeRedirectToShop(selectedProductForBuy);
      setSelectedProductForBuy(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
  };

  return (
    <div className="flex flex-col flex-1 pb-16">
      {/* Top Banner / Creator Header */}
      <div className="p-5 pb-4 border-b border-tiktok-border bg-gradient-to-b from-neutral-800/80 to-neutral-900/90 text-center relative">
        {/* User Status Bar */}
        <div className="flex justify-end mb-3">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-neutral-800/90 border border-neutral-700/80 px-2.5 py-1 rounded-full text-[11px] text-neutral-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-[120px]">{currentUser.displayName || currentUser.email}</span>
              <button
                onClick={handleLogout}
                className="hover:text-red-400 transition-colors ml-1"
                title="ออกจากระบบ"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <UserIcon className="w-3.5 h-3.5" />
              <span>ยังไม่ได้เข้าสู่ระบบ</span>
            </div>
          )}
        </div>

        {/* Creator Avatar & Info */}
        <div className="w-20 h-20 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-tiktok-red via-purple-500 to-tiktok-cyan mb-3 shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
            alt={decodedHandle}
            className="w-full h-full rounded-full object-cover border-2 border-neutral-900"
          />
        </div>

        <h1 className="text-base font-bold text-white">
          พิกัดสินค้า & คลิปรีวิว
        </h1>
        <p className="text-xs text-tiktok-cyan font-medium mt-0.5 tracking-wide">
          {decodedHandle.startsWith('@') ? decodedHandle : `@${decodedHandle}`}
        </p>

        <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto leading-relaxed">
          รวมสินค้าและของใช้ที่รีวิวในช่อง TikTok กดดูคลิปรีวิวหรือคลิกสั่งซื้อได้ทันที
        </p>

        {/* Creator TikTok Shop Link */}
        <div className="mt-3.5 flex justify-center">
          <a
            href="https://shop.tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[11px] font-medium text-neutral-200 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-tiktok-red" />
            <span>เข้าชมหน้าร้านหลักใน TikTok</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>
      </div>

      {/* Product Search Bar */}
      <div className="px-4 pt-3.5 pb-1">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า หรือรายละเอียด..."
            className="w-full bg-neutral-800/90 border border-neutral-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-tiktok-red transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={DEFAULT_CATEGORIES}
        activeCategoryId={activeCategoryId}
        onSelectCategory={setActiveCategoryId}
      />

      {/* Products Grid */}
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-xs font-semibold text-neutral-300">
            {searchQuery ? `ผลการค้นหา "${searchQuery}" (${filteredProducts.length})` : `รายการสินค้า (${filteredProducts.length})`}
          </span>
          <span className="text-[11px] text-neutral-500">
            กดซื้อเพื่อไปยัง TikTok Shop
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={handleBuyClick}
                onWatchVideo={(url, title) => setActiveVideo({ url, title })}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-400">
              <PackageOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">ไม่พบสินค้าที่คุณค้นหา</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูนะครับ
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategoryId(null);
                }}
                className="text-xs text-tiktok-red hover:underline font-medium pt-1"
              >
                ล้างคำค้นหาและแสดงสินค้าทั้งหมด
              </button>
            )}
          </div>
        )}
      </div>

      {/* Auth Modal (Login to Buy) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        product={selectedProductForBuy}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Video Review Modal */}
      <VideoModal
        isOpen={Boolean(activeVideo)}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.url || null}
        productTitle={activeVideo?.title || ''}
      />
    </div>
  );
}
