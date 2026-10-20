'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';
import { MeResponse, PublicUserView, apiRequest } from '@tiktok/server/client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<PublicUserView | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest<MeResponse>('/api/auth/me')
      .then((data) => {
        if (!data.authenticated) {
          // If not authenticated, redirect to login
          router.push('/');
        } else {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {
        router.push('/');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar currentUser={currentUser} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
