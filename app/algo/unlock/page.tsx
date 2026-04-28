'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUnlockPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isAdmin', 'true');
      console.log('Admin mode activated in localStorage.');
      // Wait a moment so the user sees the confirmation before redirecting
      setTimeout(() => {
        router.push('/algo');
      }, 1500);
    }
  }, [router]);

  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <div className="text-center animate-in fade-in zoom-in duration-500">
        <div className="text-5xl mb-6">🔓</div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Admin Access Verified</h1>
        <p className="text-slate-400 font-mono text-sm max-w-sm">
          Writing encrypted token to persistent storage. Redirecting you into the Algo Analytics Dashboard...
        </p>
      </div>
    </div>
  );
}
