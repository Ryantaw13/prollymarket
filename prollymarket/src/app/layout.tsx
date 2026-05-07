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
              <div className="flex items-center gap-6">
                <Link href="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ProllyMarket
                </Link>
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/markets" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Markets
                  </Link>
                  <Link href="/contest" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Contest
                  </Link>
                  <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Leaderboard
                  </Link>
                  <Link href="/create" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    Create
                  </Link>
                  <Link href="/achievements" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    🏆
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  Profile
                </Link>
                <ThemeToggle />
              </div>
            </div>
            {/* Mobile nav */}
            <div className="md:hidden px-4 pb-3 flex gap-4 flex-wrap">
              <Link href="/markets" className="text-gray-600 dark:text-gray-300">Markets</Link>
              <Link href="/contest" className="text-gray-600 dark:text-gray-300">Contest</Link>
              <Link href="/leaderboard" className="text-gray-600 dark:text-gray-300">Leaderboard</Link>
              <Link href="/create" className="text-gray-600 dark:text-gray-300">Create</Link>
              <Link href="/profile" className="text-gray-600 dark:text-gray-300">Profile</Link>
              <Link href="/achievements" className="text-gray-600 dark:text-gray-300">🏆</Link>
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