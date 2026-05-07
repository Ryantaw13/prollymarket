export interface User {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  balance: number;
  createdAt: Date;
}

export interface Market {
  id: number;
  question: string;
  description: string;
  category: string;
  imageUrl?: string;
  creatorId: number;
  yesPrice: number;
  noPrice: number;
  volume: number;
  outcome?: 'YES' | 'NO' | null;
  closesAt?: Date;
  createdAt: Date;
  isResolved: boolean;
}

export interface Bet {
  id: number;
  userId: number;
  marketId: number;
  amount: number;
  outcome: 'YES' | 'NO';
  price: number;
  payout?: number;
  realized: boolean;
  createdAt: Date;
}

export interface CreateMarketInput {
  question: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  closesAt?: string;
}

export interface CreateBetInput {
  marketId: number;
  amount: number;
  outcome: 'YES' | 'NO';
}

let users: User[] = [
  { id: 1, username: 'demo', email: 'demo@test.com', passwordHash: '$2a$10$demo', displayName: 'Demo User', balance: 1000, createdAt: new Date() },
];
let markets: Market[] = [
  { id: 1, question: 'Will it rain tomorrow?', description: 'Weather forecast for your area', category: 'weather', creatorId: 1, yesPrice: 0.45, noPrice: 0.55, volume: 500, outcome: null, createdAt: new Date(), isResolved: false },
  { id: 2, question: 'Will the test be cancelled?', description: 'School exam cancellation', category: 'school', creatorId: 1, yesPrice: 0.30, noPrice: 0.70, volume: 200, outcome: null, createdAt: new Date(), isResolved: false },
  { id: 3, question: 'Will there be a snow day?', description: 'School closure due to snow', category: 'school', creatorId: 1, yesPrice: 0.20, noPrice: 0.80, volume: 1000, outcome: null, createdAt: new Date(), isResolved: false },
];
let bets: Bet[] = [];

let nextUserId = 2;
let nextMarketId = 4;
let nextBetId = 1;

export function getUsers() { return users; }
export function getMarkets() { return markets; }
export function getBets() { return bets; }
export function getMarketById(id: number) { return markets.find(m => m.id === id); }
export function getUserById(id: number) { return users.find(u => u.id === id); }
export function getUserByUsername(username: string) { return users.find(u => u.username === username); }
export function getUserByEmail(email: string) { return users.find(u => u.email === email); }

export function createUser(data: { username: string; email: string; passwordHash: string; displayName: string }) {
  const user: User = { ...data, id: nextUserId++, balance: 1000, createdAt: new Date() };
  users.push(user);
  return user;
}

export function updateUserBalance(userId: number, amount: number) {
  const user = users.find(u => u.id === userId);
  if (user) {
    user.balance += amount;
  }
  return user;
}

export function createMarket(data: CreateMarketInput & { creatorId: number }) {
  const market: Market = {
    id: nextMarketId++,
    question: data.question,
    description: data.description || '',
    category: data.category || 'general',
    imageUrl: data.imageUrl,
    creatorId: data.creatorId,
    yesPrice: 0.5,
    noPrice: 0.5,
    volume: 0,
    outcome: null,
    closesAt: data.closesAt ? new Date(data.closesAt) : undefined,
    createdAt: new Date(),
    isResolved: false,
  };
  markets.push(market);
  return market;
}

export function resolveMarket(marketId: number, outcome: 'YES' | 'NO') {
  const market = markets.find(m => m.id === marketId);
  if (market && !market.isResolved) {
    market.isResolved = true;
    market.outcome = outcome;
    return market;
  }
  return null;
}

export function createBet(data: CreateBetInput & { userId: number }) {
  const market = markets.find(m => m.id === data.marketId);
  if (!market || market.isResolved) return null;
  
  const user = users.find(u => u.id === data.userId);
  if (!user || user.balance < data.amount) return null;
  
  const price = data.outcome === 'YES' ? market.yesPrice : market.noPrice;
  const totalCost = data.amount * price;
  
  if (user.balance < totalCost) return null;
  
  user.balance -= totalCost;
  
  const bet: Bet = {
    id: nextBetId++,
    userId: data.userId,
    marketId: data.marketId,
    amount: data.amount,
    outcome: data.outcome,
    price,
    realized: false,
    createdAt: new Date(),
  };
  bets.push(bet);
  
  market.volume += Math.round(totalCost * 100) / 100;
  
  return bet;
}

export function settleBets(marketId: number, outcome: 'YES' | 'NO') {
  const market = markets.find(m => m.id === marketId);
  if (!market) return;
  
  const marketBets = bets.filter(b => b.marketId === marketId && !b.realized);
  
  for (const bet of marketBets) {
    if (bet.outcome === outcome) {
      const payout = bet.amount / bet.price;
      bet.realized = true;
      bet.payout = payout;
      const user = users.find(u => u.id === bet.userId);
      if (user) user.balance += payout;
    }
  }
}