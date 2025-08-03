import { 
  Keypair, 
  Asset, 
  Operation, 
  TransactionBuilder, 
  Account,
  Horizon,
} from '@stellar/stellar-sdk';
import { Server } from '@stellar/stellar-sdk/lib/horizon';
import { STELLAR_CONFIG, NGNT_ASSET } from '@/config/stellar';

export class StellarService {
  private server: Server;

  constructor() {
    this.server = new Server(STELLAR_CONFIG.horizonUrl);
  }

  async getAccountInfo(publicKey: string): Promise<any | null> {
    try {
      const account = await this.server.loadAccount(publicKey);
      return account;
    } catch (error) {
      console.error('Error loading account:', error);
      return null;
    }
  }

  async getAccountBalance(publicKey: string, assetCode?: string): Promise<string> {
    try {
      const account = await this.getAccountInfo(publicKey);
      if (!account) return '0';

      const balance = account.balances.find((b: any) => {
        if (assetCode) {
          return b.asset_type !== 'native' && 
                 (b as any).asset_code === assetCode;
        }
        return b.asset_type === 'native';
      });

      return balance?.balance || '0';
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  }

  async hasNGNTTrustline(publicKey: string): Promise<boolean> {
    try {
      const account = await this.getAccountInfo(publicKey);
      if (!account) return false;

      return account.balances.some((balance: any) => {
        if (balance.asset_type === 'native') return false;
        const assetBalance = balance as any;
        return assetBalance.asset_code === NGNT_ASSET.code && 
               assetBalance.asset_issuer === NGNT_ASSET.issuer;
      });
    } catch (error) {
      console.error('Error checking trustline:', error);
      return false;
    }
  }

  createNGNTAsset(): Asset {
    return new Asset(NGNT_ASSET.code, NGNT_ASSET.issuer);
  }

  async buildPaymentTransaction(
    sourcePublicKey: string,
    destinationPublicKey: string,
    amount: string,
    asset?: Asset
  ): Promise<string> {
    try {
      const sourceAccount = await this.server.loadAccount(sourcePublicKey);
      const paymentAsset = asset || this.createNGNTAsset();

      const transaction = new TransactionBuilder(sourceAccount, {
        fee: '100',
        networkPassphrase: STELLAR_CONFIG.networkPassphrase,
      })
        .addOperation(
          Operation.payment({
            destination: destinationPublicKey,
            asset: paymentAsset,
            amount: amount,
          })
        )
        .setTimeout(30)
        .build();

      return transaction.toXDR();
    } catch (error) {
      console.error('Error building payment transaction:', error);
      throw error;
    }
  }

  async getTransactionHistory(publicKey: string, limit = 10): Promise<any[]> {
    try {
      const response = await this.server.transactions()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();
      
      return response.records;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  async getPaymentHistory(publicKey: string, limit = 10): Promise<any[]> {
    try {
      const response = await this.server.payments()
        .forAccount(publicKey)
        .order('desc')
        .limit(limit)
        .call();
      
      return response.records.filter((record: any) => 
        record.type === 'payment'
      );
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }
}

export const stellarService = new StellarService();