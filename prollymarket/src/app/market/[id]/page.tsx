'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
  creatorId: number;
}

interface Bet {
  id: number;
  amount: number;
  outcome: string;
  price: number;
  payout?: number;
  realized: boolean;
}

export default function MarketPage() {
  const params = useParams();
  const router = useRouter();
  const [market, setMarket] = useState<Market | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [betting, setBetting] = useState(false);
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ balance: number } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken || '');
    
    fetch(`/api/markets?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        setMarket(data.market);
        setBets(data.bets || []);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, [params.id, router]);

  useEffect(() => {
    if (token) {
      fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setUser(data.user))
        .catch(() => {});
    }
  }, [token]);

  const formatPrice = (price: number) => (price * 100).toFixed(0) + '¢';
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  const placeBet = async (outcome: 'YES' | 'NO') => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    setError('');
    setBetting(true);
    
    try {
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ marketId: market?.id, amount: parseFloat(amount), outcome }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to place bet');
      } else {
        setMarket(data.market);
        setUser({ balance: data.balance });
        localStorage.setItem('token', data.token || token);
      }
    } catch {
      setError('Failed to place bet');
    }
    
    setBetting(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  if (!market) {
    return <div className="card text-center py-12">Market not found</div>;
  }

  return (
    <div>
      <button onClick={() => router.push('/')} className="text-indigo-600 hover:underline mb-4">
        ← Back to markets
      </button>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 uppercase">{market.category}</span>
          <span className="text-sm text-gray-500">{formatVolume(market.volume)}</span>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{market.question}</h1>
        {market.description && <p className="text-gray-600 mb-4">{market.description}</p>}
        
        {market.isResolved && (
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            market.outcome === 'YES' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            Resolved: {market.outcome}
          </div>
        )}
      </div>

      {!market.isResolved && (
        <div className="card mb-6">
          <h2 className="font-medium mb-4">Place a Bet</h2>
          
          {user && (
            <p className="text-sm text-gray-500 mb-4">Your balance: ${user.balance.toFixed(2)}</p>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="100"
              className="input"
              min="1"
              step="1"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="flex gap-4">
            <button
              onClick={() => placeBet('YES')}
              disabled={betting || !amount}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy YES {amount && `@ ${formatPrice(market.yesPrice)}`}
            </button>
            <button
              onClick={() => placeBet('NO')}
              disabled={betting || !amount}
              className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy NO {amount && `@ ${formatPrice(market.noPrice)}`}
            </button>
          </div>
          
          {amount && (
            <p className="text-sm text-gray-500 mt-2">
              Cost: ${(parseFloat(amount || '0') * (market.yesPrice || 0)).toFixed(2)} (YES) / ${(parseFloat(amount || '0') * (market.noPrice || 0)).toFixed(2)} (NO)
            </p>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="font-medium mb-4">Recent Bets</h2>
        {bets.length === 0 ? (
          <p className="text-gray-500">No bets yet</p>
        ) : (
          <div className="space-y-2">
            {bets.slice(0, 10).map(bet => (
              <div key={bet.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className={bet.outcome === 'YES' ? 'text-green-600' : 'text-red-600'}>
                  {bet.outcome} @ {formatPrice(bet.price)}
                </span>
                <span>${bet.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}