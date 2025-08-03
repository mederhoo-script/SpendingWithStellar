'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, Menu, X } from 'lucide-react';
import { truncateAddress } from '@/lib/utils';
import { APP_CONFIG } from '@/config/stellar';

interface NavbarProps {
  wallet?: string;
  isAdmin?: boolean;
}

export default function Navbar({ wallet, isAdmin }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleDisconnect = () => {
    localStorage.removeItem('connected_wallet');
    router.push('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-stellar-700">
                {APP_CONFIG.name}
              </h1>
            </div>
            
            {wallet && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </button>
                
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin Panel
                  </button>
                )}
              </div>
            )}
          </div>

          {wallet && (
            <div className="flex items-center">
              <div className="hidden md:flex md:items-center md:space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">
                    {truncateAddress(wallet)}
                  </span>
                </div>
                
                <button
                  onClick={handleDisconnect}
                  className="btn-secondary text-sm"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Disconnect
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMenu}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {wallet && isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <button
              onClick={() => {
                router.push('/dashboard');
                setIsMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
            >
              Dashboard
            </button>
            
            {isAdmin && (
              <button
                onClick={() => {
                  router.push('/admin');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700"
              >
                Admin Panel
              </button>
            )}
            
            <div className="px-3 py-2 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {truncateAddress(wallet)}
                </span>
              </div>
              
              <button
                onClick={handleDisconnect}
                className="btn-secondary text-sm w-full"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}