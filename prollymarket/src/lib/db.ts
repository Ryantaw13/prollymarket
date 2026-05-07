import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

export const db = {
  user: {
    findUnique: async (params: { where: { id?: number; username?: string; email?: string } }) => {
      return prisma.user.findUnique(params as any);
    },
    create: async (data: { username: string; email: string; passwordHash: string; displayName: string }) => {
      return prisma.user.create({ data: { ...data, balance: 1000 } });
    },
    update: async (params: { where: { id: number }; data: { balance?: number } }) => {
      return prisma.user.update(params);
    },
    findFirst: async (params: { where: { id: number } }) => {
      return prisma.user.findFirst(params);
    },
  },
  market: {
    findMany: async (params?: { where?: { category?: string } }) => {
      return prisma.market.findMany(params as any);
    },
    findUnique: async (params: { where: { id: number } }) => {
      return prisma.market.findUnique(params);
    },
    create: async (data: { question: string; description?: string; category?: string; imageUrl?: string; closesAt?: Date; creatorId: number }) => {
      return prisma.market.create({ data });
    },
    update: async (params: { where: { id: number }; data: { volume?: number; yesPrice?: number; noPrice?: number; isResolved?: boolean; outcome?: string } }) => {
      return prisma.market.update(params);
    },
  },
  bet: {
    findMany: async (params?: { where?: { marketId?: number; userId?: number } }) => {
      return prisma.bet.findMany(params as any);
    },
    create: async (data: { userId: number; marketId: number; amount: number; outcome: string; price: number }) => {
      return prisma.bet.create({ data });
    },
    update: async (params: { where: { id: number }; data: { payout?: number; realized?: boolean } }) => {
      return prisma.bet.update(params);
    },
  },
};