'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cowrieService, WithdrawResponse } from '@/lib/cowrie';
import { firebaseService } from '@/lib/firebase';
import { isValidAmount, formatNumber } from '@/lib/utils';
import { ButtonLoading } from '@/components/Loading';

interface WithdrawFormProps {
  wallet: string;
  maxAmount: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface BankDetails {
  accountNumber: string;
  bankName: string;
  accountName: string;
}

export default function WithdrawForm({ wallet, maxAmount, onSuccess, onCancel }: WithdrawFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    bankDetails: {
      accountNumber: '',
      bankName: '',
      accountName: '',
    } as BankDetails,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withdrawResponse, setWithdrawResponse] = useState<WithdrawResponse | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bank.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [bankField]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError(null);
  };

  const validateForm = () => {
    const maxAmountNum = parseFloat(maxAmount);
    const amountNum = parseFloat(formData.amount);

    if (!formData.amount || !isValidAmount(formData.amount, 100, maxAmountNum)) {
      setError(`Please enter a valid amount between 100 and ${formatNumber(maxAmountNum)} NGNT`);
      return false;
    }

    if (!formData.bankDetails.accountNumber || formData.bankDetails.accountNumber.length < 10) {
      setError('Please enter a valid account number (minimum 10 digits)');
      return false;
    }

    if (!formData.bankDetails.bankName.trim()) {
      setError('Please select or enter your bank name');
      return false;
    }

    if (!formData.bankDetails.accountName.trim()) {
      setError('Please enter the account holder name');
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
      // Request withdrawal from Cowrie
      const response = await cowrieService.requestWithdraw({
        asset_code: 'NGNT',
        type: 'bank_account',
        dest: formData.bankDetails.accountNumber,
        dest_extra: JSON.stringify({
          bank_name: formData.bankDetails.bankName,
          account_name: formData.bankDetails.accountName,
        }),
        account: wallet,
      });

      setWithdrawResponse(response);

      // Save transaction to database
      await firebaseService.saveTransaction({
        wallet,
        type: 'withdraw',
        amount: formData.amount,
        status: 'pending',
        metadata: {
          cowrieReference: response.id,
          bankDetails: formData.bankDetails,
        },
      });

    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      setError('Failed to process withdrawal request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = () => {
    onSuccess();
  };

  if (withdrawResponse) {
    return (
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">Withdrawal Request Submitted</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="card-body">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-green-800 mb-2">Request Successful</h4>
            <p className="text-green-700 text-sm mb-4">
              Your withdrawal request has been submitted successfully.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-600">Amount:</span>
                <span className="font-medium">{formatNumber(formData.amount)} NGNT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Bank:</span>
                <span className="font-medium">{formData.bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Account:</span>
                <span className="font-medium font-mono">{formData.bankDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-600">Reference:</span>
                <span className="font-medium font-mono">{withdrawResponse.id}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Your request is being processed by Cowrie Anchor</li>
              <li>• Funds will be sent to your bank account within 1-3 business days</li>
              <li>• You can track the status in your transaction history</li>
              <li>• Contact support if you don't receive funds within 5 business days</li>
            </ul>
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

  const nigerianBanks = [
    'Access Bank',
    'Fidelity Bank',
    'First Bank of Nigeria',
    'First City Monument Bank (FCMB)',
    'Guaranty Trust Bank (GTBank)',
    'Keystone Bank',
    'Polaris Bank',
    'Providus Bank',
    'Stanbic IBTC Bank',
    'Standard Chartered Bank',
    'Sterling Bank',
    'Union Bank',
    'United Bank for Africa (UBA)',
    'Unity Bank',
    'Wema Bank',
    'Zenith Bank',
  ];

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-semibold">Withdraw NGNT to Bank</h3>
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
              min="100"
              max={maxAmount}
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="bank.bankName" className="form-label">
              Bank Name
            </label>
            <select
              id="bank.bankName"
              name="bank.bankName"
              value={formData.bankDetails.bankName}
              onChange={handleInputChange}
              className="form-input"
              required
            >
              <option value="">Select your bank</option>
              {nigerianBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bank.accountNumber" className="form-label">
              Account Number
            </label>
            <input
              type="text"
              id="bank.accountNumber"
              name="bank.accountNumber"
              value={formData.bankDetails.accountNumber}
              onChange={handleInputChange}
              placeholder="Enter your account number"
              className="form-input"
              minLength={10}
              maxLength={12}
              pattern="[0-9]+"
              required
            />
          </div>

          <div>
            <label htmlFor="bank.accountName" className="form-label">
              Account Holder Name
            </label>
            <input
              type="text"
              id="bank.accountName"
              name="bank.accountName"
              value={formData.bankDetails.accountName}
              onChange={handleInputChange}
              placeholder="Enter account holder name"
              className="form-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Must match the name on your bank account
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-danger flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <ButtonLoading text="Processing..." /> : 'Request Withdrawal'}
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