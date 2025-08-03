'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { stellarService } from '@/lib/stellar';
import { albedoService } from '@/lib/albedo';
import { firebaseService } from '@/lib/firebase';
import { isValidStellarAddress, isValidAmount, formatNumber } from '@/lib/utils';
import { ButtonLoading } from '@/components/Loading';

interface TransferFormProps {
  wallet: string;
  maxAmount: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TransferForm({ wallet, maxAmount, onSuccess, onCancel }: TransferFormProps) {
  const [formData, setFormData] = useState({
    destinationWallet: '',
    amount: '',
    memo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.destinationWallet || !isValidStellarAddress(formData.destinationWallet)) {
      setError('Please enter a valid Stellar wallet address (starts with G)');
      return false;
    }

    if (formData.destinationWallet === wallet) {
      setError('Cannot transfer to the same wallet');
      return false;
    }

    const maxAmountNum = parseFloat(maxAmount);
    const amountNum = parseFloat(formData.amount);

    if (!formData.amount || !isValidAmount(formData.amount, 0.01, maxAmountNum)) {
      setError(`Please enter a valid amount between 0.01 and ${formatNumber(maxAmountNum)} NGNT`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Check if destination wallet exists and has NGNT trustline
      const destinationAccount = await stellarService.getAccountInfo(formData.destinationWallet);
      if (!destinationAccount) {
        setError('Destination wallet does not exist or is not funded');
        setIsSubmitting(false);
        return;
      }

      const destinationHasTrustline = await stellarService.hasNGNTTrustline(formData.destinationWallet);
      if (!destinationHasTrustline) {
        const confirmTransfer = confirm(
          'The destination wallet does not have an NGNT trustline. The transfer may fail. Do you want to continue?'
        );
        if (!confirmTransfer) {
          setIsSubmitting(false);
          return;
        }
      }

      // Build transaction
      const xdr = await stellarService.buildPaymentTransaction(
        wallet,
        formData.destinationWallet,
        formData.amount
      );

      // Sign and submit transaction with Albedo
      const result = await albedoService.signTransaction(xdr, wallet, true);
      
      if (!result.txHash) {
        throw new Error('Transaction was not submitted successfully');
      }

      setTxHash(result.txHash);

      // Save transactions to database
      await Promise.all([
        // Outgoing transaction for sender
        firebaseService.saveTransaction({
          wallet,
          type: 'transfer_out',
          amount: formData.amount,
          status: 'completed',
          metadata: {
            destinationWallet: formData.destinationWallet,
            txHash: result.txHash,
          },
        }),
        // Incoming transaction for receiver
        firebaseService.saveTransaction({
          wallet: formData.destinationWallet,
          type: 'transfer_in',
          amount: formData.amount,
          status: 'completed',
          metadata: {
            sourceWallet: wallet,
            txHash: result.txHash,
          },
        }),
      ]);

    } catch (err) {
      console.error('Error sending transfer:', err);
      setError(err instanceof Error ? err.message : 'Failed to send transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
  };

  if (txHash) {
    return (
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">Transfer Successful</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="card-body">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <Send className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h4 className="font-semibold text-green-800 mb-2">Transfer Complete!</h4>
            <p className="text-green-700 text-sm mb-4">
              Your NGNT has been successfully sent.
            </p>
            
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-green-600">Amount:</span>
                <span className="font-medium">{formatNumber(formData.amount)} NGNT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">To:</span>
                <span className="font-medium font-mono text-xs">
                  {formData.destinationWallet.slice(0, 8)}...{formData.destinationWallet.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Transaction:</span>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium font-mono text-xs text-stellar-600 hover:underline"
                >
                  {txHash.slice(0, 8)}...{txHash.slice(-8)}
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="btn-primary w-full"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-semibold">Send NGNT</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="card-body">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            <strong>Available Balance:</strong> {formatNumber(maxAmount)} NGNT
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="destinationWallet" className="form-label">
              Destination Wallet Address
            </label>
            <input
              type="text"
              id="destinationWallet"
              name="destinationWallet"
              value={formData.destinationWallet}
              onChange={handleInputChange}
              placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="form-input font-mono text-sm"
              maxLength={56}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the recipient's Stellar wallet address (starts with G)
            </p>
          </div>

          <div>
            <label htmlFor="amount" className="form-label">
              Amount (NGNT)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder={`Enter amount (max: ${formatNumber(maxAmount)})`}
              className="form-input"
              min="0.01"
              max={maxAmount}
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="form-label">
              Memo (Optional)
            </label>
            <textarea
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleInputChange}
              placeholder="Add a note for this transfer (optional)"
              className="form-input"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum 200 characters
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Transaction Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-600">Amount:</span>
                <span className="font-medium">
                  {formData.amount ? `${formatNumber(formData.amount)} NGNT` : '0 NGNT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Network Fee:</span>
                <span className="font-medium">~0.00001 XLM</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <ButtonLoading text="Sending..." /> : 'Send NGNT'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}