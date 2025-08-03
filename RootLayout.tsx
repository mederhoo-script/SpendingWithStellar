import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Global header/nav could go here */}
        {children}
      </body>
    </html>
  );
}
