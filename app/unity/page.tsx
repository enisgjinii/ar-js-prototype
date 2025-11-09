'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UnityView from '@/components/unity-view';

export default function UnityPage() {
  const router = useRouter();

  return (
    <div className="w-full h-screen">
      <UnityView onBack={() => router.back()} />
    </div>
  );
}
