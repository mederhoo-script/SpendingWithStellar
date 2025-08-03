import './globals.css';

export const metadata = {
  title: 'Stellar NGN Spending App',
  description: 'Spend NGNT on Stellar Network with Cowrie Anchor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
