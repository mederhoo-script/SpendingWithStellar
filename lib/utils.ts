import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: string | number, decimals = 2): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(numValue);
}

export function formatCurrency(amount: string | number, currency = 'NGNT'): string {
  const formattedAmount = formatNumber(amount);
  return `${formattedAmount} ${currency}`;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function truncateAddress(address: string, chars = 8): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function isValidStellarAddress(address: string): boolean {
  // Basic validation for Stellar public key format
  return /^G[A-Z2-7]{55}$/.test(address);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidAmount(amount: string, min = 0, max = Infinity): boolean {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= min && numAmount <= max;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  
  // Fallback for older browsers
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return Promise.resolve();
  } catch (err) {
    document.body.removeChild(textArea);
    return Promise.reject(err);
  }
}

export function getTransactionTypeLabel(type: string): string {
  switch (type) {
    case 'deposit':
      return 'Deposit';
    case 'withdraw':
      return 'Withdrawal';
    case 'transfer_in':
      return 'Transfer In';
    case 'transfer_out':
      return 'Transfer Out';
    default:
      return type;
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function generateTransactionReference(): string {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}