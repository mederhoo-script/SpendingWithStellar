'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { PageLoading } from '@/components/Loading';
import { APP_CONFIG } from '@/config/stellar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const connectedWallet = localStorage.getItem('connected_wallet');
    
    if (!connectedWallet) {
      router.push('/');
      return;
    }

    const isUserAdmin = connectedWallet === APP_CONFIG.adminWallet;
    
    if (!isUserAdmin) {
      router.push('/dashboard');
      return;
    }

    setWallet(connectedWallet);
    setIsAdmin(true);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!wallet || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar wallet={wallet} isAdmin={isAdmin} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}