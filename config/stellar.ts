import { Networks } from '@stellar/stellar-sdk';

export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET,
  horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'mainnet' 
    ? Networks.PUBLIC 
    : Networks.TESTNET,
};

export const NGNT_ASSET = {
  code: process.env.NEXT_PUBLIC_COWRIE_ASSET_CODE || 'NGNT',
  issuer: process.env.NEXT_PUBLIC_COWRIE_ASSET_ISSUER || 'GAWODAROMZVLLYQVC2OMFG3MBEQ5FBPJNV5KYDW4BPVPQY3ZRTQFQB4C',
};

export const COWRIE_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_COWRIE_BASE_URL || 'https://testanchor.stellar.org',
  assetCode: NGNT_ASSET.code,
  assetIssuer: NGNT_ASSET.issuer,
};

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Stellar NGN Spending App',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  adminWallet: process.env.ADMIN_WALLET_PUBLIC_KEY,
};