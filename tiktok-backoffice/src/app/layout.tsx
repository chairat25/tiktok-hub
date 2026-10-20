import type { Metadata } from 'next';
import './globals.css';

// Pages must render per request so Next.js can apply the CSP nonce from middleware.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'TikTok Catalog Backoffice',
  description: 'ระบบจัดการสินค้า หมวดหมู่ และลิงก์ TikTok สำหรับ Creator & Admin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className="dark">
      <body className="bg-slate-900 text-slate-100 min-h-screen antialiased flex flex-col">
        {children}
      </body>
    </html>
  );
}
