'use client';

import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  productTitle: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  productTitle,
}) => {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative text-left">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-tiktok-red fill-tiktok-red" />
            <h3 className="text-xs font-semibold text-white truncate max-w-[200px]">
              {productTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Preview / Link Action */}
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-tiktok-red shadow-lg shadow-tiktok-red/10">
            <Play className="w-8 h-8 fill-tiktok-red ml-1" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">
              คลิปวิดีโอรีวิวบน TikTok
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              คลิกด้านล่างเพื่อเปิดรับชมวิดีโอรีวิวเต็มบนแอปพลิเคชัน TikTok หรือเบราว์เซอร์
            </p>
          </div>

          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-tiktok-red hover:bg-tiktok-red/90 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-tiktok-red/20"
          >
            <span>เปิดดูคลิปใน TikTok</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
