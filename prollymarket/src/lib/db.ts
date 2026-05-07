import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

// For legacy db.user.create syntax compatibility
export const db = {
  user: {
    findUnique: (params: any) => prisma.user.findUnique(params),
    findFirst: (params: any) => prisma.user.findFirst(params),
    create: (data: any) => prisma.user.create(data),
    update: (params: any) => prisma.user.update(params),
    upsert: (params: any) => prisma.user.upsert(params),
  },
  market: {
    findMany: (params?: any) => prisma.market.findMany(params),
    findUnique: (params: any) => prisma.market.findUnique(params),
    create: (data: any) => prisma.market.create(data),
    update: (params: any) => prisma.market.update(params),
    count: (params?: any) => prisma.market.count(params),
  },
  bet: {
    findMany: (params?: any) => prisma.bet.findMany(params),
    create: (data: any) => prisma.bet.create(data),
    update: (params: any) => prisma.bet.update(params),
  },
  comment: {
    findMany: (params?: any) => prisma.comment.findMany(params),
    create: (data: any) => prisma.comment.create(data),
    count: (params?: any) => prisma.comment.count(params),
  },
  alert: {
    findMany: (params?: any) => prisma.alert.findMany(params),
    create: (data: any) => prisma.alert.create(data),
    delete: (params: any) => prisma.alert.delete(params),
  },
  priceHistory: {
    create: (data: any) => prisma.priceHistory.create(data),
    findMany: (params?: any) => prisma.priceHistory.findMany(params),
  },
  dailyBonus: {
    findMany: (params?: any) => prisma.dailyBonus.findMany(params),
    create: (data: any) => prisma.dailyBonus.create(data),
  },
};