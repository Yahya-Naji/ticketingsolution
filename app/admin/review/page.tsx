'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AdminReviewQueue } from '@/components/admin/admin-review-queue';
import { useAuthStore } from '@/lib/store';

export default function AdminReviewPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!isAdmin()) {
      router.push('/ideas');
      return;
    }
  }, [user, isAdmin, router]);

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminReviewQueue />
      </div>
    </div>
  );
}
