# Constructive Feedback for Teachers

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)](https://tailwindcss.com)

Platform for students to share constructive feedback with teachers. Designed to protect against reputational harm and content that could get the site banned.

## Features

- AI-powered moderation to block harmful content
- Aggregated feedback summaries (teachers never see individual comments)
- Conservative auto-approval (only truly constructive feedback)
- Manual review queue for edge cases

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js |
| AI | OpenRouter (Nemotron 3 Super, Nemotron Nano, free) |

## Project Structure

```
constructive-feedback/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/
│   │   ├── actions/       # Server actions
│   │   ├── api/          # API routes
│   │   ├── teachers/     # Teacher pages
│   │   └── login/        # Auth pages
│   ├── components/        # React components
│   ├── lib/
│   │   ├── ai.ts        # AI moderation
│   │   ├── auth.ts      # NextAuth config
│   │   └── db.ts       # Prisma client
│   └── styles/          # CSS
├── .env.example         # Env template
├── next.config.ts
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up database
npx prisma db push

# Start dev server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXTAUTH_URL` | App URL |
| `OPENROUTER_API_KEY` | OpenRouter API key |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript check |
| `npm run db:push` | Push database schema |

## How It Works

1. Student submits feedback
2. AI moderates:
   - `constructive` → auto-add to summary
   - `neutral`/`insulting`/`other` → manual review
3. Teacher sees AI-generated summary only

### Auto-Approval Criteria

| Category | Example | Auto-Approve? |
|----------|----------|---------------|
| constructive | "too fast" | ✓ |
| constructive | "great explanations" | ✓ |
| neutral | "boring" | ✗ |
| neutral | "okay" | ✗ |
| insulting | "teacher is useless" | ✗ |
| insulting | "good but he's lazy" | ✗ |

**Rule**: Mixed feedback = insulting (manual review)

## Safety Features

- Teachers see only aggregated summaries, never individual feedback
- Mixed constructive + insulting = goes to manual review
- AI errors default to manual review (fail-safe)
- Personal attacks always blocked

## Code Quality

| Check | Status |
|-------|--------|
| TypeScript | No type errors |
| Build | Compiles successfully |
| Lint | Passes |

## License

MIT
