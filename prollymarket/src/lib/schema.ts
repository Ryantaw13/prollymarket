import { integer, text, pgTable, uniqueIndex, index, timestamp, decimal, boolean, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name'),
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('1000'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  usernameIdx: uniqueIndex('username_idx').on(table.username),
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

export const markets = pgTable('markets', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  description: text('description'),
  category: text('category').notNull().default('general'),
  imageUrl: text('image_url'),
  creatorId: integer('creator_id').notNull(),
  yesPrice: decimal('yes_price', { precision: 5, scale: 4 }).notNull().default('0.50'),
  noPrice: decimal('no_price', { precision: 5, scale: 4 }).notNull().default('0.50'),
  volume: integer('volume').notNull().default(0),
  outcome: text('outcome'),
  closesAt: timestamp('closes_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isResolved: boolean('is_resolved').notNull().default(false),
}, (table) => ({
  creatorIdx: index('creator_idx').on(table.creatorId),
  categoryIdx: index('category_idx').on(table.category),
}));

export const bets = pgTable('bets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  marketId: integer('market_id').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  outcome: text('outcome').notNull(),
  price: decimal('price', { precision: 5, scale: 4 }).notNull(),
  payout: decimal('payout', { precision: 12, scale: 2 }),
  realized: boolean('realized').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdx: index('user_idx').on(table.userId),
  marketIdx: index('market_idx').on(table.marketId),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Market = typeof markets.$inferSelect;
export type NewMarket = typeof markets.$inferInsert;
export type Bet = typeof bets.$inferSelect;
export type NewBet = typeof bets.$inferInsert;