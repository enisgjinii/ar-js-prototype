'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import NativeARView from '@/components/native-ar-view';

export default function ARPage() {
  const router = useRouter();

  return (
    <NativeARView
      modelUrl="/models/sample.glb"
      modelTitle="Sample 3D Model"
      onBack={() => router.back()}
    />
  );
}
