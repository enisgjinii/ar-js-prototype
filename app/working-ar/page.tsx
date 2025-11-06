"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import WorkingARView from '@/components/working-ar-view';

export default function WorkingARPage() {
  const router = useRouter();

  return (
    <div className="w-full h-screen">
      <WorkingARView onBack={() => router.back()} />
    </div>
  );
}
