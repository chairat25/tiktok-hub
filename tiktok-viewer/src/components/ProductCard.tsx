'use client';

import React from 'react';
import { ShoppingBag, Video, ExternalLink } from 'lucide-react';
import { IProduct } from '@tiktok/types';

interface ProductCardProps {
  product: IProduct;
  onBuy: (product: IProduct) => void;
  onWatchVideo?: (videoUrl: string, productTitle: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuy,
  onWatchVideo,
}) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div className="bg-neutral-800/70 border border-neutral-700/60 rounded-xl overflow-hidden hover:border-neutral-500 transition-all flex flex-col group">
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Video review badge if exists */}
        {product.tiktokVideoUrl && (
          <button
            onClick={() => onWatchVideo && onWatchVideo(product.tiktokVideoUrl!, product.title)}
            className="absolute top-2 left-2 bg-black/75 hover:bg-tiktok-red text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 transition-colors border border-white/10"
          >
            <Video className="w-3.5 h-3.5" />
            <span>ดูคลิปรีวิว</span>
          </button>
        )}

        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-tiktok-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
            SALE
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm line-clamp-2 text-neutral-100 group-hover:text-white leading-snug">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-xs text-neutral-400 line-clamp-1 mt-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Price and Action */}
        <div className="pt-2 border-t border-neutral-700/50 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold text-white flex items-baseline gap-1.5">
              <span>฿{(hasDiscount ? product.discountPrice! : product.price).toLocaleString()}</span>
              {hasDiscount && (
                <span className="text-xs text-neutral-500 line-through">
                  ฿{product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onBuy(product)}
            className="bg-tiktok-red hover:bg-tiktok-red/90 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-tiktok-red/20 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ซื้อสินค้า</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
