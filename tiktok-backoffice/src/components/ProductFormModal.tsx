'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Package } from 'lucide-react';
import { IProduct, ICategory, ProductType } from '@tiktok/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ICategory[];
  productToEdit: IProduct | null;
  onSave: (productData: Partial<IProduct>) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  categories,
  productToEdit,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [productType, setProductType] = useState<ProductType>(ProductType.TIKTOK_SHOP);
  const [tiktokProductUrl, setTiktokProductUrl] = useState('');
  const [tiktokVideoUrl, setTiktokVideoUrl] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setDescription(productToEdit.description || '');
      setCategoryId(productToEdit.categoryId);
      setPrice(productToEdit.price);
      setDiscountPrice(productToEdit.discountPrice || '');
      setImageUrl(productToEdit.imageUrl);
      setProductType(productToEdit.productType);
      setTiktokProductUrl(productToEdit.tiktokProductUrl);
      setTiktokVideoUrl(productToEdit.tiktokVideoUrl || '');
    } else {
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setPrice('');
      setDiscountPrice('');
      setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
      setProductType(ProductType.TIKTOK_SHOP);
      setTiktokProductUrl('https://shop.tiktok.com');
      setTiktokVideoUrl('');
    }
  }, [productToEdit, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !tiktokProductUrl) return;

    onSave({
      title,
      description,
      categoryId,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      imageUrl,
      productType,
      tiktokProductUrl,
      tiktokVideoUrl: tiktokVideoUrl || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative text-left my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <h3 className="text-base font-bold text-white">
              {productToEdit ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ชื่อสินค้า *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น เซรั่มบำรุงผิวหน้าไฮยาลูรอน"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                หมวดหมู่สินค้า *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ประเภทสินค้า
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value={ProductType.TIKTOK_SHOP}>TikTok Shop สินค้าโดยตรง</option>
                <option value={ProductType.TIKTOK_AFFILIATE}>TikTok Affiliate Showcase</option>
                <option value={ProductType.EXTERNAL_LINK}>External Link อื่นๆ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ราคาปกติ (บาท) *
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="490"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ราคาโปรโมชั่น (ถ้ามี)
              </label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="350"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์รูปภาพสินค้า (Image URL) *
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์ TikTok Shop หรือ Affiliate สำหรับให้ผู้ชมกดซื้อ *
            </label>
            <input
              type="url"
              required
              value={tiktokProductUrl}
              onChange={(e) => setTiktokProductUrl(e.target.value)}
              placeholder="https://shop.tiktok.com/view/product/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ลิงก์คลิปวิดีโอรีวิวบน TikTok (สำหรับปุ่ม &quot;ดูคลิปรีวิว&quot;)
            </label>
            <input
              type="url"
              value={tiktokVideoUrl}
              onChange={(e) => setTiktokVideoUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@creator/video/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              รายละเอียดสินค้าเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="จุดเด่นสินค้า สรรพคุณ หรือข้อความแนะนำสั้นๆ"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกข้อมูลสินค้า</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
