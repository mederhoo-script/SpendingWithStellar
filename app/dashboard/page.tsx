'use client';

import { useState, useEffect } from 'react';
import { Wallet, Plus, Minus, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { stellarService } from '@/lib/stellar';
import { firebaseService, Transaction } from '@/lib/firebase';
import { formatCurrency, truncateAddress } from '@/lib/utils';
import { NGNT_ASSET } from '@/config/stellar';
import TransactionTable from '@/components/TransactionTable';
import LoadingSpinner from '@/components/Loading';
import DepositForm from './DepositForm';
import WithdrawForm from './WithdrawForm';
import TransferForm from './TransferForm';

export default function DashboardPage() {
  const [wallet, setWallet] = useState<string>('');
  const [ngntBalance, setNgntBalance] = useState<string>('0');
  const [xlmBalance, setXlmBalance] = useState<string>('0');
  const [hasTrustline, setHasTrustline] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeForm, setActiveForm] = useState<'deposit' | 'withdraw' | 'transfer' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectedWallet = localStorage.getItem('connected_wallet');
    if (connectedWallet) {
      setWallet(connectedWallet);
      loadDashboardData(connectedWallet);
    }
  }, []);

  const loadDashboardData = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Load account info and balances
      const [accountInfo, ngntBal, xlmBal, trustlineExists, userTransactions] = await Promise.all([
        stellarService.getAccountInfo(walletAddress),
        stellarService.getAccountBalance(walletAddress, NGNT_ASSET.code),
        stellarService.getAccountBalance(walletAddress),
        stellarService.hasNGNTTrustline(walletAddress),
        firebaseService.getTransactionsByWallet(walletAddress, 20),
      ]);

      if (!accountInfo) {
        setError('Unable to load account information. Please check your connection.');
        return;
      }

      setNgntBalance(ngntBal);
      setXlmBalance(xlmBal);
      setHasTrustline(trustlineExists);
      setTransactions(userTransactions);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (wallet) {
      setIsRefreshing(true);
      await loadDashboardData(wallet);
      setIsRefreshing(false);
    }
  };

  const handleFormSuccess = () => {
    setActiveForm(null);
    handleRefresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-secondary"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Wallet Info */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold flex items-center">
            <Wallet className="mr-2" />
            Wallet Information
          </h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Wallet Address</label>
              <p className="font-mono text-sm text-gray-600 bg-gray-100 p-2 rounded">
                {truncateAddress(wallet, 12)}
              </p>
            </div>
            
            <div>
              <label className="form-label">NGNT Trustline</label>
              <div className="flex items-center">
                {hasTrustline ? (
                  <span className="text-green-600 flex items-center">
                    ✓ Active
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center">
                    ✗ Not Added
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Balances */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-lg font-semibold text-ngn-700 mb-2">NGNT Balance</h3>
            <p className="text-3xl font-bold text-ngn-600">
              {formatCurrency(ngntBalance)}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-body text-center">
            <h3 className="text-lg font-semibold text-stellar-700 mb-2">XLM Balance</h3>
            <p className="text-3xl font-bold text-stellar-600">
              {formatCurrency(xlmBalance, 'XLM')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveForm('deposit')}
              className="btn-success flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Deposit NGNT
            </button>

            <button
              onClick={() => setActiveForm('withdraw')}
              disabled={parseFloat(ngntBalance) <= 0}
              className="btn-danger flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="h-5 w-5 mr-2" />
              Withdraw NGNT
            </button>

            <button
              onClick={() => setActiveForm('transfer')}
              disabled={parseFloat(ngntBalance) <= 0}
              className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5 mr-2" />
              Send NGNT
            </button>
          </div>
        </div>
      </div>

      {/* Forms */}
      {activeForm === 'deposit' && (
        <DepositForm
          wallet={wallet}
          onSuccess={handleFormSuccess}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {activeForm === 'withdraw' && (
        <WithdrawForm
          wallet={wallet}
          maxAmount={ngntBalance}
          onSuccess={handleFormSuccess}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {activeForm === 'transfer' && (
        <TransferForm
          wallet={wallet}
          maxAmount={ngntBalance}
          onSuccess={handleFormSuccess}
          onCancel={() => setActiveForm(null)}
        />
      )}

      {/* Transaction History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <TransactionTable transactions={transactions} />
      </div>
    </div>
  );
}