'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Market {
  id: number;
  question: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  isResolved: boolean;
  outcome?: string;
}

export default function Home() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/markets')
      .then(res => res.json())
      .then(data => {
        setMarkets(data.markets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatPrice = (price: number) => (price * 100).toFixed(0) + '¢';
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prediction Markets</h1>
        <p className="text-gray-600 dark:text-gray-400">Trade on anything with fake money. No risk, just practice.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading markets...</div>
      ) : markets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No markets yet</p>
          <Link href="/create" className="btn-primary">
            Create the first market
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {markets.map(market => (
            <Link key={market.id} href={`/market/${market.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{market.category}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{formatVolume(market.volume)}</span>
              </div>
              <h3 className="font-medium text-lg mb-3">{market.question}</h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-green-50 dark:bg-green-900/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">YES</div>
                  <div className="text-green-600 dark:text-green-400 font-bold">{formatPrice(market.yesPrice)}</div>
                </div>
                <div className="flex-1 bg-red-50 dark:bg-red-900/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">NO</div>
                  <div className="text-red-600 dark:text-red-400 font-bold">{formatPrice(market.noPrice)}</div>
                </div>
              </div>
              {market.isResolved && (
                <div className={`mt-3 text-sm font-medium ${market.outcome === 'YES' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Resolved: {market.outcome}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}