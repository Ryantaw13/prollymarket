import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// Re-export with easier naming
export const db = {
  user: prisma.user,
  market: prisma.market,
  bet: prisma.bet,
  comment: prisma.comment,
  alert: prisma.alert,
  priceHistory: prisma.priceHistory,
  dailyBonus: prisma.dailyBonus,
};