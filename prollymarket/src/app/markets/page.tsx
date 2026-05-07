'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Market {
  id: number;
  question: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  volume24h: number;
  commentCount: number;
  isResolved: boolean;
  outcome?: string;
  creator?: { username: string; displayName: string };
}

export default function Markets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'school', label: 'School' },
    { value: 'sports', label: 'Sports' },
    { value: 'politics', label: 'Politics' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'weather', label: 'Weather' },
    { value: 'entertainment', label: 'Entertainment' },
  ];

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    params.set('sort', sort);
    
    fetch(`/api/markets?${params}`)
      .then(res => res.json())
      .then(data => {
        setMarkets(data.markets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, sort]);

  const filteredMarkets = search 
    ? markets.filter(m => m.question.toLowerCase().includes(search.toLowerCase()))
    : markets;

  const formatPrice = (price: number) => (price * 100).toFixed(0) + '¢';
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Markets</h1>
        <p className="text-gray-600 dark:text-gray-400">Trade on anything with fake money</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search markets..."
          className="input max-w-md"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              category === cat.value 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700"
        >
          <option value="newest">Newest</option>
          <option value="trending">Trending</option>
          <option value="volume">Most Volume</option>
          <option value="closing">Closing Soon</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading markets...</div>
      ) : filteredMarkets.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No markets found</p>
          <Link href="/create" className="btn-primary">
            Create a market
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredMarkets.map(market => (
            <Link key={market.id} href={`/market/${market.id}`} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {market.category}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatVolume(market.volume)}</span>
                  {market.commentCount > 0 && (
                    <span>💬 {market.commentCount}</span>
                  )}
                </div>
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
                <div className={`mt-3 text-sm font-medium ${
                  market.outcome === 'YES' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
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