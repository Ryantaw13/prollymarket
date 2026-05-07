# ProllyMarket

A Manifold-style prediction market with fake money.

## Features

- Create yes/no prediction markets on any topic (school, sports, politics, etc.)
- Trade with fake money ($1,000 starting balance)
- Real-time price updates based on trading
- Cloud-ready (deploys to Vercel/Netlify)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- In-memory store (swap for database in production)

## Deployment

Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

## API Routes

- `POST /api/register` - Create account
- `POST /api/login` - Login
- `GET /api/markets` - List markets
- `POST /api/markets/create` - Create market (auth required)
- `POST /api/bet` - Place bet (auth required)
- `GET /api/me` - Get user profile (auth required)