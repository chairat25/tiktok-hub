'use client';

import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  ExternalLink,
  Video,
  MousePointerClick,
} from 'lucide-react';
import { IProduct, ICategory, ProductType } from '@tiktok/types';
import { ProductFormModal } from '@/components/ProductFormModal';

const INITIAL_CATEGORIES: ICategory[] = [
  { id: 'cat-1', creatorId: 'c1', name: 'สกินแคร์ & บิวตี้', slug: 'beauty', sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-2', creatorId: 'c1', name: 'อุปกรณ์ไอที & แกดเจ็ต', slug: 'tech', sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-3', creatorId: 'c1', name: 'ของใช้ในบ้าน', slug: 'home', sortOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cat-4', creatorId: 'c1', name: 'แฟชั่น & เครื่องแต่งกาย', slug: 'fashion', sortOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

const INITIAL_PRODUCTS: IProduct[] = [
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

export default function ProductsPage() {
  const [categories] = useState<ICategory[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<IProduct[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<IProduct | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: IProduct) => {
    setProductToEdit(p);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('คุณต้องการลบสินค้ารายการนี้ใช่หรือไม่?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleSaveProduct = (formData: Partial<IProduct>) => {
    if (productToEdit) {
      setProducts(
        products.map((p) => (p.id === productToEdit.id ? ({ ...p, ...formData, updatedAt: new Date() } as IProduct) : p))
      );
    } else {
      const newProduct: IProduct = {
        id: `prod-${Date.now()}`,
        creatorId: 'c1',
        categoryId: formData.categoryId || categories[0].id,
        title: formData.title || '',
        description: formData.description,
        price: formData.price || 0,
        discountPrice: formData.discountPrice,
        imageUrl: formData.imageUrl || '',
        productType: formData.productType || ProductType.TIKTOK_SHOP,
        tiktokProductUrl: formData.tiktokProductUrl || '',
        tiktokVideoUrl: formData.tiktokVideoUrl,
        clickCount: 0,
        sortOrder: products.length + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setProducts([newProduct, ...products]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-blue-500" />
            <span>จัดการสินค้าและลิงก์ TikTok</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            สินค้าที่เพิ่มและเปิดใช้งานจะแสดงผลบนหน้าร้าน TikTok Viewer ทันที
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="all">ทุกหมวดหมู่สินค้า ({products.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">รูป & ชื่อสินค้า</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4">ราคา</th>
                <th className="py-3.5 px-4">ลิงก์ TikTok Shop & คลิป</th>
                <th className="py-3.5 px-4 text-center">สถิติกดซื้อ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.map((p) => {
                const cat = categories.find((c) => c.id === p.categoryId);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-11 h-11 rounded-lg object-cover bg-slate-950 flex-shrink-0 border border-slate-800"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-white line-clamp-1">{p.title}</p>
                          <span className="text-[10px] text-slate-500">
                            {p.productType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {cat?.name || 'ไม่ระบุ'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">
                        ฿{(p.discountPrice || p.price).toLocaleString()}
                      </div>
                      {p.discountPrice && (
                        <div className="text-[10px] text-slate-500 line-through">
                          ฿{p.price.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* Links */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={p.tiktokProductUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="ลิงก์สินค้า TikTok Shop"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                        </a>
                        {p.tiktokVideoUrl && (
                          <a
                            href={p.tiktokVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="ลิงก์คลิปรีวิว TikTok"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Clicks */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        <MousePointerClick className="w-3 h-3 text-emerald-400" />
                        <span>{p.clickCount} ครั้ง</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        productToEdit={productToEdit}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
