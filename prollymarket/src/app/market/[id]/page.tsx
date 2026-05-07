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
  const [user, setUser] = useState<{ id: number; balance: number } | null>(null);
  const [showResolve, setShowResolve] = useState(false);
  const [resolveOutcome, setResolveOutcome] = useState<'YES' | 'NO'>('YES');
  const [resolving, setResolving] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetch(`/api/markets?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        setMarket(data.market);
        setBets(data.bets || []);
        setComments(data.comments || []);
        setLoading(false);
      })
      .catch(() => router.push('/'));
  }, [params.id, router]);

  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => setUser(data.user))
      .catch(() => {});
  }, []);

  const formatPrice = (price: number) => (price * 100).toFixed(0) + '¢';
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}K`;
    return `$${volume}`;
  };

  const placeBet = async (outcome: 'YES' | 'NO') => {
    setError('');
    setBetting(true);
    
    try {
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId: market?.id, amount: parseFloat(amount), outcome }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to place bet');
      } else {
        setMarket(data.market);
        setUser({ id: data.user.id, balance: data.balance });
      }
    } catch {
      setError('Failed to place bet');
    }
    
    setBetting(false);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!market) {
    return <div className="card text-center py-12">Market not found</div>;
  }

  return (
    <div>
      <button onClick={() => router.push('/')} className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4">
        ← Back to markets
      </button>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{market.category}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{formatVolume(market.volume)}</span>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">{market.question}</h1>
        {market.description && <p className="text-gray-600 dark:text-gray-300 mb-4">{market.description}</p>}
        
        {market.isResolved && (
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            market.outcome === 'YES' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>
            Resolved: {market.outcome}
          </div>
        )}

        {!market.isResolved && user && user.id === market.creatorId && (
          <button
            onClick={() => setShowResolve(true)}
            className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Resolve this market
          </button>
        )}
      </div>

      {showResolve && !market.isResolved && (
        <div className="card mb-6 border-2 border-indigo-500">
          <h2 className="font-medium mb-4">Resolve Market</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            This will pay out winners and finalize the market.
          </p>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setResolveOutcome('YES')}
              className={`flex-1 py-2 rounded-lg font-medium ${
                resolveOutcome === 'YES' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              YES wins
            </button>
            <button
              onClick={() => setResolveOutcome('NO')}
              className={`flex-1 py-2 rounded-lg font-medium ${
                resolveOutcome === 'NO' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              NO wins
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setResolving(true);
                const res = await fetch('/api/markets/resolve', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ marketId: market.id, outcome: resolveOutcome }),
                });
                const data = await res.json();
                if (res.ok) {
                  setMarket(data.market);
                  setShowResolve(false);
                } else {
                  alert(data.error);
                }
                setResolving(false);
              }}
              disabled={resolving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {resolving ? 'Resolving...' : 'Confirm Resolution'}
            </button>
            <button
              onClick={() => setShowResolve(false)}
              className="px-4 py-2 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!market.isResolved && (
        <div className="card mb-6">
          <h2 className="font-medium mb-4">Place a Bet</h2>
          
          {user && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your balance: ${user.balance.toFixed(2)}</p>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Cost: ${(parseFloat(amount || '0') * (market.yesPrice || 0)).toFixed(2)} (YES) / ${(parseFloat(amount || '0') * (market.noPrice || 0)).toFixed(2)} (NO)
            </p>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="font-medium mb-4">Recent Bets</h2>
        {bets.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No bets yet</p>
        ) : (
          <div className="space-y-2">
            {bets.slice(0, 10).map(bet => (
              <div key={bet.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className={bet.outcome === 'YES' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {bet.outcome} @ {formatPrice(bet.price)}
                </span>
                <span>${bet.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="card mt-6">
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center justify-between w-full"
        >
          <h2 className="font-medium">Comments ({market.commentCount || 0})</h2>
          <span>{showComments ? '▼' : '▶'}</span>
        </button>
        
        {showComments && (
          <div className="mt-4">
            {/* Add Comment */}
            {user && (
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input min-h-[80px]"
                  maxLength={500}
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">{newComment.length}/500</span>
                  <button
                    onClick={async () => {
                      if (!newComment.trim()) return;
                      setPostingComment(true);
                      const res = await fetch(`/api/markets/${market.id}/comment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ marketId: market.id, content: newComment })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        setComments([data.comment, ...comments]);
                        setNewComment('');
                      }
                      setPostingComment(false);
                    }}
                    disabled={postingComment || !newComment.trim()}
                    className="btn-primary text-sm"
                  >
                    {postingComment ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            )}
            
            {/* Comments List */}
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No comments yet. Be the first!
                </p>
              )}
              {comments.map((comment: any) => (
                <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.user?.displayName || comment.user?.username || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}