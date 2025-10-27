'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TEXT } from '@/lib/constants';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login
    router.push('/login');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-600">{TEXT.common.loading}</div>
    </div>
  );
}
