import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ProllyMarket - Fake Money Prediction Markets',
  description: 'Practice prediction market trading with fake money',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Providers>
          <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                ProllyMarket
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/markets" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Markets
                </Link>
                <Link href="/create" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Create Market
                </Link>
                <ThemeToggle />
              </div>
            </div>
          </nav>
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}