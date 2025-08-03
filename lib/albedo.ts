declare global {
  interface Window {
    albedo: {
      publicKey: (options?: { 
        token?: string; 
        callback?: string; 
        require_existing?: boolean; 
        network?: string; 
      }) => Promise<{ pubkey: string; signed_message?: string; message_signature?: string; }>;
      
      tx: (options: {
        xdr: string;
        network?: string;
        callback?: string;
        pubkey?: string;
        submit?: boolean;
      }) => Promise<{ 
        xdr: string; 
        tx_hash?: string; 
        signed_envelope_xdr?: string; 
        result?: any; 
      }>;
      
      trust: (options: {
        asset_code: string;
        asset_issuer: string;
        network?: string;
        callback?: string;
        limit?: string;
      }) => Promise<{ 
        xdr: string; 
        tx_hash?: string; 
        signed_envelope_xdr?: string; 
        result?: any; 
      }>;
      
      sign_message: (options: {
        message: string;
        pubkey?: string;
        network?: string;
        callback?: string;
      }) => Promise<{
        message_signature: string;
        pubkey: string;
      }>;
    };
  }
}

export interface AlbedoConnectionResult {
  publicKey: string;
  signedMessage?: string;
  messageSignature?: string;
}

export interface AlbedoTransactionResult {
  xdr: string;
  txHash?: string;
  signedEnvelopeXdr?: string;
  result?: any;
}

export class AlbedoService {
  private isAlbedoAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.albedo;
  }

  async connectWallet(): Promise<AlbedoConnectionResult> {
    if (!this.isAlbedoAvailable()) {
      throw new Error('Albedo wallet not available. Please install Albedo extension.');
    }

    try {
      const result = await window.albedo.publicKey({
        network: 'testnet',
        require_existing: false,
      });

      return {
        publicKey: result.pubkey,
        signedMessage: result.signed_message,
        messageSignature: result.message_signature,
      };
    } catch (error) {
      console.error('Error connecting to Albedo wallet:', error);
      throw error;
    }
  }

  async signTransaction(xdr: string, publicKey?: string, submit = true): Promise<AlbedoTransactionResult> {
    if (!this.isAlbedoAvailable()) {
      throw new Error('Albedo wallet not available. Please install Albedo extension.');
    }

    try {
      const result = await window.albedo.tx({
        xdr,
        network: 'testnet',
        pubkey: publicKey,
        submit,
      });

      return {
        xdr: result.xdr,
        txHash: result.tx_hash,
        signedEnvelopeXdr: result.signed_envelope_xdr,
        result: result.result,
      };
    } catch (error) {
      console.error('Error signing transaction with Albedo:', error);
      throw error;
    }
  }

  async addTrustline(assetCode: string, assetIssuer: string, limit?: string): Promise<AlbedoTransactionResult> {
    if (!this.isAlbedoAvailable()) {
      throw new Error('Albedo wallet not available. Please install Albedo extension.');
    }

    try {
      const result = await window.albedo.trust({
        asset_code: assetCode,
        asset_issuer: assetIssuer,
        network: 'testnet',
        limit,
      });

      return {
        xdr: result.xdr,
        txHash: result.tx_hash,
        signedEnvelopeXdr: result.signed_envelope_xdr,
        result: result.result,
      };
    } catch (error) {
      console.error('Error adding trustline with Albedo:', error);
      throw error;
    }
  }

  async signMessage(message: string, publicKey?: string): Promise<{ messageSignature: string; publicKey: string }> {
    if (!this.isAlbedoAvailable()) {
      throw new Error('Albedo wallet not available. Please install Albedo extension.');
    }

    try {
      const result = await window.albedo.sign_message({
        message,
        pubkey: publicKey,
        network: 'testnet',
      });

      return {
        messageSignature: result.message_signature,
        publicKey: result.pubkey,
      };
    } catch (error) {
      console.error('Error signing message with Albedo:', error);
      throw error;
    }
  }

  getWalletInstallUrl(): string {
    return 'https://albedo.link/install';
  }

  isWalletInstalled(): boolean {
    return this.isAlbedoAvailable();
  }
}

export const albedoService = new AlbedoService();