# Stellar NGN Spending App

A Next.js application for spending Nigerian Naira (NGNT) on the Stellar Network, featuring integration with Cowrie Anchor for deposits/withdrawals, Albedo wallet for authentication, and Firebase for data storage.

## Features

### User Features
- **Wallet Connection**: Connect using Albedo wallet browser extension
- **NGNT Deposits**: Deposit Nigerian Naira through Cowrie Anchor (SEP-6) using bank transfers
- **NGNT Withdrawals**: Withdraw NGNT directly to Nigerian bank accounts
- **NGNT Transfers**: Send NGNT to other Stellar wallets instantly
- **Transaction History**: View all transaction history with detailed information
- **Automatic Trustline Management**: Prompts to add NGNT trustline when needed

### Admin Features
- **User Management**: View all registered users and their join dates
- **Transaction Monitoring**: Monitor all transactions with advanced filtering
- **Analytics Dashboard**: View system stats including total users, volume, and pending withdrawals
- **User Lookup**: Search and filter transactions by wallet address
- **Real-time Updates**: Refresh data to see latest transactions and user activity

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Stellar SDK, Albedo Wallet integration
- **Anchor**: Cowrie Anchor (SEP-6) for NGNT deposits/withdrawals
- **Database**: Firebase Firestore for user and transaction data
- **Deployment**: Vercel-ready configuration

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── dashboard/               # User dashboard
│   ├── admin/                   # Admin panel
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable UI components
├── lib/                        # Utility libraries
│   ├── stellar.ts              # Stellar SDK integration
│   ├── albedo.ts               # Albedo wallet integration
│   ├── cowrie.ts               # Cowrie Anchor (SEP-6) integration
│   ├── firebase.ts             # Firebase/Firestore utilities
│   └── utils.ts                # Helper functions
├── config/                     # Configuration files
│   ├── firebase.ts             # Firebase configuration
│   └── stellar.ts              # Stellar network configuration
└── public/                     # Static assets
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Firebase project
- Albedo wallet browser extension

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd SpendingWithStellar
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stellar Network (testnet by default)
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Cowrie Anchor Configuration
NEXT_PUBLIC_COWRIE_BASE_URL=https://testanchor.stellar.org
NEXT_PUBLIC_COWRIE_ASSET_CODE=NGNT
NEXT_PUBLIC_COWRIE_ASSET_ISSUER=GAWODAROMZVLLYQVC2OMFG3MBEQ5FBPJNV5KYDW4BPVPQY3ZRTQFQB4C

# Admin Configuration (replace with your admin wallet public key)
ADMIN_WALLET_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Application Configuration
NEXT_PUBLIC_APP_NAME=Stellar NGN Spending App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Create the following collections in Firestore:
   - `users` - stores user wallet addresses and join dates
   - `transactions` - stores all transaction records
4. Configure Firebase security rules to allow read/write access

### 4. Install Albedo Wallet

Users need the Albedo wallet browser extension:
- Chrome/Edge: [Chrome Web Store](https://chrome.google.com/webstore/detail/albedo/ehhaahfpbfimjbfjdklidemjbdchdhjl)
- Firefox: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/albedo/)

### 5. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Testing with Stellar Testnet

1. **Get Test XLM**: Use the [Stellar Laboratory](https://laboratory.stellar.org/#account-creator) to create and fund test accounts
2. **Add NGNT Trustline**: The app will prompt to add the NGNT trustline when connecting
3. **Test Deposits/Withdrawals**: The app includes mock Cowrie services for testing when the real endpoints are unavailable

## Production Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on git push

### Environment Variables for Production

Update your environment variables for production:
- Change `NEXT_PUBLIC_STELLAR_NETWORK` to `mainnet` if using mainnet
- Update `NEXT_PUBLIC_STELLAR_HORIZON_URL` to mainnet Horizon URL
- Configure production Firebase project
- Set production Cowrie Anchor URLs
- Set the admin wallet public key

## Usage

### For Users

1. **Connect Wallet**: Click "Connect Albedo Wallet" on the homepage
2. **Add Trustline**: Add NGNT trustline if prompted
3. **Deposit NGNT**: Use the deposit form to get bank transfer instructions
4. **Send NGNT**: Transfer NGNT to other Stellar wallets
5. **Withdraw**: Withdraw NGNT to Nigerian bank accounts
6. **View History**: Monitor all your transactions in the dashboard

### For Admins

1. **Access Admin Panel**: Connect with the configured admin wallet
2. **Monitor Users**: View all registered users and their activity
3. **Track Transactions**: Filter and search all platform transactions
4. **Handle Support**: Use transaction lookup for user support

## Mock Services

The application includes mock implementations for Cowrie Anchor services to enable testing when the real endpoints are unavailable. These provide realistic responses for:
- Deposit information and instructions
- Withdrawal requests and confirmations
- Transaction status updates

## Security Considerations

- All transactions are signed by user's Albedo wallet
- Private keys never leave the user's browser
- Firebase security rules should be configured appropriately
- Admin access is controlled by wallet address verification
- All amounts and addresses are validated before processing

## Support

For issues and questions:
- Check the browser console for error messages
- Verify Albedo wallet connection
- Ensure NGNT trustline is added
- Contact support through the application

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.