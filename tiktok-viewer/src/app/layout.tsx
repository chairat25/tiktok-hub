import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TikTok Catalog Showcase',
  description: 'รวมสินค้าและคลิปรีวิวจาก Creator ทาง TikTok',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="bg-tiktok-dark text-white min-h-screen antialiased flex flex-col items-center">
        <main className="w-full max-w-md min-h-screen flex flex-col bg-neutral-900 border-x border-tiktok-border shadow-2xl relative">
          {children}
        </main>
      </body>
    </html>
  );
}
