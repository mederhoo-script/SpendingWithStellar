'use client';

import { useState, useEffect } from 'react';
import { Users, Activity, TrendingUp, AlertCircle, RefreshCw, Search, Filter } from 'lucide-react';
import { firebaseService, User, Transaction } from '@/lib/firebase';
import { formatCurrency, formatDate, truncateAddress } from '@/lib/utils';
import TransactionTable from '@/components/TransactionTable';
import LoadingSpinner from '@/components/Loading';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchWallet, setSearchWallet] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    pendingWithdrawals: 0,
    totalVolume: 0,
  });

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, searchWallet, filterType, filterStatus]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [allUsers, allTransactions] = await Promise.all([
        firebaseService.getAllUsers(),
        firebaseService.getAllTransactions(100),
      ]);

      setUsers(allUsers);
      setTransactions(allTransactions);

      // Calculate stats
      const pendingWithdrawals = allTransactions.filter(
        tx => tx.type === 'withdraw' && tx.status === 'pending'
      ).length;

      const totalVolume = allTransactions
        .filter(tx => tx.status === 'completed')
        .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

      setStats({
        totalUsers: allUsers.length,
        totalTransactions: allTransactions.length,
        pendingWithdrawals,
        totalVolume,
      });

    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAdminData();
    setIsRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Search by wallet
    if (searchWallet.trim()) {
      filtered = filtered.filter(tx =>
        tx.wallet.toLowerCase().includes(searchWallet.toLowerCase()) ||
        (tx.metadata?.destinationWallet?.toLowerCase().includes(searchWallet.toLowerCase())) ||
        (tx.metadata?.sourceWallet?.toLowerCase().includes(searchWallet.toLowerCase()))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  };

  const handleUserLookup = async (wallet: string) => {
    setSearchWallet(wallet);
    setFilterType('all');
    setFilterStatus('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Monitor users, transactions, and system health</p>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-stellar-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingWithdrawals}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-ngn-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalVolume)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Registered Users</h2>
        </div>
        <div className="card-body">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.wallet} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {truncateAddress(user.wallet, 12)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.joinedAt.toDate())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleUserLookup(user.wallet)}
                          className="text-stellar-600 hover:text-stellar-900"
                        >
                          View Transactions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Filters */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Transaction Monitor</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="form-label">
                <Search className="inline h-4 w-4 mr-1" />
                Search by Wallet
              </label>
              <input
                type="text"
                value={searchWallet}
                onChange={(e) => setSearchWallet(e.target.value)}
                placeholder="Enter wallet address..."
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                <Filter className="inline h-4 w-4 mr-1" />
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-input"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdraw">Withdrawals</option>
                <option value="transfer_in">Transfers In</option>
                <option value="transfer_out">Transfers Out</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                <Filter className="inline h-4 w-4 mr-1" />
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>

          <TransactionTable transactions={filteredTransactions} showWallet={true} />
        </div>
      </div>
    </div>
  );
}