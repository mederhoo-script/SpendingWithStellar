'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Globe, DollarSign, Shield } from 'lucide-react';
import { albedoService } from '@/lib/albedo';
import { firebaseService } from '@/lib/firebase';
import { stellarService } from '@/lib/stellar';
import { NGNT_ASSET } from '@/config/stellar';

export default function HomePage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already connected
    const connectedWallet = localStorage.getItem('connected_wallet');
    if (connectedWallet) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (!albedoService.isWalletInstalled()) {
        window.open(albedoService.getWalletInstallUrl(), '_blank');
        setError('Please install Albedo wallet extension first');
        setIsConnecting(false);
        return;
      }

      const connection = await albedoService.connectWallet();
      
      // Save user to database
      await firebaseService.saveUser(connection.publicKey);
      
      // Store connection in localStorage
      localStorage.setItem('connected_wallet', connection.publicKey);
      
      // Check if user has NGNT trustline
      const hasTrustline = await stellarService.hasNGNTTrustline(connection.publicKey);
      
      if (!hasTrustline) {
        // Prompt to add trustline
        const shouldAddTrustline = confirm(
          'You need to add NGNT trustline to use this app. Do you want to add it now?'
        );
        
        if (shouldAddTrustline) {
          try {
            await albedoService.addTrustline(NGNT_ASSET.code, NGNT_ASSET.issuer);
          } catch (trustlineError) {
            console.error('Error adding trustline:', trustlineError);
            // Continue anyway, user can add trustline later
          }
        }
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stellar-50 to-ngn-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Stellar NGN Spending App
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Spend Nigerian Naira (NGNT) on the Stellar Network with ease
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 max-w-md mx-auto">
              {error}
            </div>
          )}
          
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting}
            className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connecting...
              </span>
            ) : (
              <span className="flex items-center">
                <Wallet className="mr-2" size={20} />
                Connect Albedo Wallet
              </span>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="card">
            <div className="card-body text-center">
              <DollarSign className="mx-auto mb-4 text-ngn-600" size={48} />
              <h3 className="text-lg font-semibold mb-2">Deposit NGNT</h3>
              <p className="text-gray-600">
                Deposit Nigerian Naira through Cowrie Anchor using bank transfers
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <Globe className="mx-auto mb-4 text-stellar-600" size={48} />
              <h3 className="text-lg font-semibold mb-2">Send NGNT</h3>
              <p className="text-gray-600">
                Transfer NGNT to any Stellar wallet instantly and securely
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <Wallet className="mx-auto mb-4 text-stellar-600" size={48} />
              <h3 className="text-lg font-semibold mb-2">Withdraw to Bank</h3>
              <p className="text-gray-600">
                Withdraw NGNT directly to your Nigerian bank account
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-body text-center">
              <Shield className="mx-auto mb-4 text-ngn-600" size={48} />
              <h3 className="text-lg font-semibold mb-2">Secure & Fast</h3>
              <p className="text-gray-600">
                Built on Stellar blockchain with Albedo wallet security
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card max-w-4xl mx-auto">
          <div className="card-header">
            <h2 className="text-2xl font-semibold">Getting Started</h2>
          </div>
          <div className="card-body">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-stellar-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-stellar-700 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold mb-2">Install Albedo</h3>
                <p className="text-gray-600">
                  Install the Albedo wallet browser extension to manage your Stellar account
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-stellar-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-stellar-700 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold mb-2">Connect Wallet</h3>
                <p className="text-gray-600">
                  Connect your Albedo wallet and add NGNT trustline if needed
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-stellar-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <span className="text-stellar-700 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold mb-2">Start Trading</h3>
                <p className="text-gray-600">
                  Deposit, withdraw, and transfer NGNT with ease through our platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600">
          <p>
            Powered by{' '}
            <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="text-stellar-600 hover:underline">
              Stellar Network
            </a>
            {' '}and{' '}
            <a href="https://cowrie.exchange" target="_blank" rel="noopener noreferrer" className="text-ngn-600 hover:underline">
              Cowrie Anchor
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}