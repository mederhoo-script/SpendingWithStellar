import { formatCurrency, formatDate, getTransactionTypeLabel, getStatusColor } from '@/lib/utils';
import { Transaction } from '@/lib/firebase';

interface TransactionTableProps {
  transactions: Transaction[];
  showWallet?: boolean;
}

export default function TransactionTable({ transactions, showWallet = false }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <p className="text-gray-500">No transactions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {showWallet && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(transaction.createdAt.toDate())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getTransactionTypeLabel(transaction.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                {showWallet && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {transaction.wallet.slice(0, 8)}...{transaction.wallet.slice(-8)}
                  </td>
                )}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {transaction.type === 'transfer_out' && transaction.metadata?.destinationWallet && (
                    <div>
                      To: {transaction.metadata.destinationWallet.slice(0, 8)}...{transaction.metadata.destinationWallet.slice(-8)}
                    </div>
                  )}
                  {transaction.type === 'transfer_in' && transaction.metadata?.sourceWallet && (
                    <div>
                      From: {transaction.metadata.sourceWallet.slice(0, 8)}...{transaction.metadata.sourceWallet.slice(-8)}
                    </div>
                  )}
                  {transaction.type === 'withdraw' && transaction.metadata?.bankDetails && (
                    <div>
                      Bank: {transaction.metadata.bankDetails.bankName}
                    </div>
                  )}
                  {transaction.metadata?.txHash && (
                    <div className="text-xs text-stellar-600">
                      Hash: {transaction.metadata.txHash.slice(0, 12)}...
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}