import axios from 'axios';
import { COWRIE_CONFIG } from '@/config/stellar';

export interface DepositInfo {
  how: string;
  eta?: number;
  min_amount?: number;
  max_amount?: number;
  fee_fixed?: number;
  fee_percent?: number;
  extra_info?: any;
}

export interface WithdrawInfo {
  account_id: string;
  memo_type?: string;
  memo?: string;
  eta?: number;
  min_amount?: number;
  max_amount?: number;
  fee_fixed?: number;
  fee_percent?: number;
  extra_info?: any;
}

export interface DepositRequest {
  asset_code: string;
  account: string;
  memo_type?: string;
  memo?: string;
  email_address?: string;
  type?: string;
}

export interface DepositResponse {
  how: string;
  id: string;
  eta?: number;
  min_amount?: number;
  max_amount?: number;
  fee_fixed?: number;
  fee_percent?: number;
  extra_info?: any;
  instructions?: any;
}

export interface WithdrawRequest {
  asset_code: string;
  type: string;
  dest: string;
  dest_extra?: string;
  account: string;
  memo_type?: string;
  memo?: string;
}

export interface WithdrawResponse {
  account_id: string;
  memo_type?: string;
  memo?: string;
  id: string;
  eta?: number;
  min_amount?: number;
  max_amount?: number;
  fee_fixed?: number;
  fee_percent?: number;
  extra_info?: any;
}

export interface TransactionStatus {
  transaction: {
    id: string;
    kind: 'deposit' | 'withdrawal';
    status: 'incomplete' | 'pending_user_transfer_start' | 'pending_anchor' | 'pending_stellar' | 'pending_external' | 'pending_trust' | 'pending_user' | 'completed' | 'error';
    status_eta?: number;
    amount_in?: string;
    amount_out?: string;
    amount_fee?: string;
    started_at: string;
    completed_at?: string;
    stellar_transaction_id?: string;
    external_transaction_id?: string;
    message?: string;
    refunds?: any;
  };
}

export class CowrieService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = COWRIE_CONFIG.baseUrl;
  }

  async getInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/info`);
      return response.data;
    } catch (error) {
      console.error('Error getting Cowrie info:', error);
      throw error;
    }
  }

  async getDepositInfo(assetCode: string = COWRIE_CONFIG.assetCode): Promise<DepositInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/deposit`, {
        params: { asset_code: assetCode }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting deposit info:', error);
      // Return mock data if Cowrie is unavailable
      return this.getMockDepositInfo();
    }
  }

  async getWithdrawInfo(assetCode: string = COWRIE_CONFIG.assetCode): Promise<WithdrawInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/withdraw`, {
        params: { asset_code: assetCode }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting withdraw info:', error);
      // Return mock data if Cowrie is unavailable
      return this.getMockWithdrawInfo();
    }
  }

  async requestDeposit(request: DepositRequest): Promise<DepositResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/transactions/deposit/interactive`, request);
      return response.data;
    } catch (error) {
      console.error('Error requesting deposit:', error);
      // Return mock data if Cowrie is unavailable
      return this.getMockDepositResponse(request);
    }
  }

  async requestWithdraw(request: WithdrawRequest): Promise<WithdrawResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/transactions/withdraw/interactive`, request);
      return response.data;
    } catch (error) {
      console.error('Error requesting withdraw:', error);
      // Return mock data if Cowrie is unavailable
      return this.getMockWithdrawResponse(request);
    }
  }

  async getTransactionStatus(id: string): Promise<TransactionStatus> {
    try {
      const response = await axios.get(`${this.baseUrl}/transaction`, {
        params: { id }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting transaction status:', error);
      // Return mock data if Cowrie is unavailable
      return this.getMockTransactionStatus(id);
    }
  }

  // Mock methods for when Cowrie services are unavailable
  private getMockDepositInfo(): DepositInfo {
    return {
      how: 'Bank transfer to our Nigerian bank account',
      eta: 300, // 5 minutes
      min_amount: 100,
      max_amount: 1000000,
      fee_fixed: 50,
      fee_percent: 0.5,
      extra_info: {
        message: 'Mock Cowrie service - transfer funds to complete deposit'
      }
    };
  }

  private getMockWithdrawInfo(): WithdrawInfo {
    return {
      account_id: 'mock_account',
      eta: 1800, // 30 minutes
      min_amount: 100,
      max_amount: 1000000,
      fee_fixed: 100,
      fee_percent: 1.0,
      extra_info: {
        message: 'Mock Cowrie service - withdrawal will be processed to your Nigerian bank account'
      }
    };
  }

  private getMockDepositResponse(request: DepositRequest): DepositResponse {
    return {
      how: 'Bank transfer',
      id: `mock_deposit_${Date.now()}`,
      eta: 300,
      min_amount: 100,
      max_amount: 1000000,
      fee_fixed: 50,
      fee_percent: 0.5,
      instructions: {
        bank_name: 'Mock Nigerian Bank',
        account_number: '1234567890',
        account_name: 'Cowrie Mock Account',
        reference: `DEP_${Date.now()}`,
        message: 'This is a mock deposit. In production, transfer to the provided account details.'
      }
    };
  }

  private getMockWithdrawResponse(request: WithdrawRequest): WithdrawResponse {
    return {
      account_id: request.account,
      id: `mock_withdraw_${Date.now()}`,
      eta: 1800,
      min_amount: 100,
      max_amount: 1000000,
      fee_fixed: 100,
      fee_percent: 1.0,
      extra_info: {
        message: 'Mock withdrawal request created. In production, funds would be sent to your bank account.'
      }
    };
  }

  private getMockTransactionStatus(id: string): TransactionStatus {
    return {
      transaction: {
        id,
        kind: id.includes('deposit') ? 'deposit' : 'withdrawal',
        status: 'pending_anchor',
        status_eta: 300,
        amount_in: '1000',
        amount_out: '950',
        amount_fee: '50',
        started_at: new Date().toISOString(),
        message: 'Mock transaction - processing...'
      }
    };
  }
}

export const cowrieService = new CowrieService();