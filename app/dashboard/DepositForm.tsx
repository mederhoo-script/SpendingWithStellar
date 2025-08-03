'use client';

import { useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';
import { cowrieService, DepositResponse } from '@/lib/cowrie';
import { firebaseService } from '@/lib/firebase';
import { isValidEmail, isValidAmount, copyToClipboard } from '@/lib/utils';
import { ButtonLoading } from '@/components/Loading';

interface DepositFormProps {
  wallet: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepositForm({ wallet, onSuccess, onCancel }: DepositFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositResponse, setDepositResponse] = useState<DepositResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.amount || !isValidAmount(formData.amount, 100, 1000000)) {
      setError('Please enter a valid amount between 100 and 1,000,000 NGNT');
      return false;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
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
      // Request deposit from Cowrie
      const response = await cowrieService.requestDeposit({
        asset_code: 'NGNT',
        account: wallet,
        email_address: formData.email,
        type: 'bank_account',
      });

      setDepositResponse(response);

      // Save transaction to database
      await firebaseService.saveTransaction({
        wallet,
        type: 'deposit',
        amount: formData.amount,
        status: 'pending',
        metadata: {
          cowrieReference: response.id,
        },
      });

    } catch (err) {
      console.error('Error requesting deposit:', err);
      setError('Failed to process deposit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    try {
      await copyToClipboard(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleComplete = () => {
    onSuccess();
  };

  if (depositResponse) {
    return (
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold">Deposit Instructions</h3>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="card-body">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">Transfer Details</h4>
            <p className="text-blue-700 text-sm mb-4">
              Please transfer the exact amount to the following account details:
            </p>
            
            {depositResponse.instructions && (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="font-medium">{depositResponse.instructions.bank_name}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(depositResponse.instructions.bank_name, 'bank')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedField === 'bank' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="font-medium font-mono">{depositResponse.instructions.account_number}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(depositResponse.instructions.account_number, 'account')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedField === 'account' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Account Name</p>
                    <p className="font-medium">{depositResponse.instructions.account_name}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(depositResponse.instructions.account_name, 'name')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedField === 'name' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white p-3 rounded border">
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="font-medium font-mono">{depositResponse.instructions.reference}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(depositResponse.instructions.reference, 'reference')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedField === 'reference' ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Transfer exactly {formData.amount} NGN to the account above</li>
              <li>• Include the reference number in your transfer description</li>
              <li>• Your NGNT will be credited within 5-30 minutes after confirmation</li>
              <li>• Contact support if your deposit isn't credited within 1 hour</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleComplete}
              className="btn-primary flex-1"
            >
              I've Made the Transfer
            </button>
            <button
              onClick={onCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header flex items-center justify-between">
        <h3 className="text-lg font-semibold">Deposit NGNT</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="form-label">
              Amount (NGN)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="Enter amount (min: 100, max: 1,000,000)"
              className="form-input"
              min="100"
              max="1000000"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="form-input"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              You'll receive deposit confirmation at this email
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
              className="btn-success flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <ButtonLoading text="Processing..." /> : 'Request Deposit'}
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