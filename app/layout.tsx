import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ethio Market',
  description: 'Premium Telegram storefront for trending products in Ethiopia.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
