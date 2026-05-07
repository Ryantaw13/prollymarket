import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ProllyMarket - Fake Money Prediction Markets',
  description: 'Practice prediction market trading with fake money',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ProllyMarket
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/markets" className="text-gray-600 hover:text-gray-900">
                Markets
              </Link>
              <Link href="/create" className="text-gray-600 hover:text-gray-900">
                Create Market
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}