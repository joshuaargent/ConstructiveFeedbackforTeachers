# Constructive Feedback for Teachers

![Next.js](https://img.shields.io/badge/Next.js-16.2-black) ![React](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.2-38bdf8) ![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748) ![License](https://img.shields.io/badge/License-MIT-green)

> A supportive platform where students share constructive feedback to help teachers grow — with AI-powered moderation to maintain respectful discourse.

## Features

- **AI-Powered Moderation** - Automatic filtering of feedback using OpenRouter's advanced language models
- **Constructive-First Approach** - Only truly helpful feedback reaches teachers automatically
- **Privacy-Protected Summaries** - Teachers receive aggregated themes, never individual comments
- **Multi-Layer Safety** - Blocks hate speech, personal attacks, and mixed feedback with insults
- **3-Tier AI Fallback** - Reliable moderation with Nemotron Super → Nemotron Nano → Free tier
- **Modern Tech Stack** - Built with Next.js 16, React 19, and Tailwind CSS

## How It Works

```
Student submits feedback → AI evaluates tone & quality
        ↓
[Constructive + Specific + Actionable] → Auto-approved to summary
        ↓
[Neutral / Insulting / Mixed] → Flagged for manual review
        ↓
Aggregated Summary → Teacher sees themes, not individuals
```

### Feedback Classification

| Type | Examples | Handling |
|------|----------|----------|
| ✅ Constructive | "too fast", "great explanations", "more examples" | Auto-approved |
| ⚠️ Neutral | "boring", "okay", vague comments | Manual review |
| 🚫 Insulting | Personal attacks, mixed feedback with insults | Blocked/review |

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 6.0 |
| UI Library | React 19.2 |
| Styling | Tailwind CSS 4.2 |
| Database | PostgreSQL + Prisma 5.22 |
| Auth | NextAuth.js 5.0 |
| AI | OpenRouter (Nemotron 3 Super / Nano) |
| Animations | Framer Motion |
| Icons | Lucide React |

## Project Structure

```
constructive-feedback-for-teachers/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Seed data
├── public/                 # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── actions/      # Server actions
│   │   ├── api/          # API routes
│   │   ├── contact/      # Contact page
│   │   ├── login/        # Authentication
│   │   ├── register/     # User registration
│   │   └── teachers/     # Teacher dashboard
│   ├── components/
│   │   ├── home/         # Homepage components
│   │   ├── layout/       # Layout components
│   │   ├── providers/    # Context providers
│   │   ├── shared/       # Shared components
│   │   └── ui/           # UI components
│   ├── data/
│   │   └── site.ts       # Site configuration
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── vitest.config.ts       # Vitest configuration
```

## Getting Started

### Prerequisites

- Node.js 20.0.0+
- PostgreSQL database
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ConstructiveFeedbackforTeachers.git
cd ConstructiveFeedbackforTeachers

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Set up database
npx prisma db push

# (Optional) Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret for session encryption | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI moderation | ✅ |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |

## Safety Features

The platform implements multiple layers of protection:

- **Constructive Threshold** - Feedback must be specific AND actionable to auto-approve
- **Mixed Feedback Detection** - "Good but he's lazy" is flagged as insulting (manual review)
- **Individual Privacy** - Teachers see only aggregated themes, never individual submissions
- **Conservative Auto-Approval** - Only clearly constructive feedback reaches summaries
- **Graceful AI Fallback** - On error, feedback defaults to manual review queue

## AI Moderation

The platform uses OpenRouter with intelligent fallback:

1. **NVIDIA Nemotron 3 Super 120B** - Primary model for nuanced classification
2. **NVIDIA Nemotron Nano 9B** - Fallback for faster processing
3. **openrouter/free** - Ultimate fallback ensuring service continuity

## License

MIT License - Open source and free to use as a template.

---

Built with ❤️ to foster constructive teacher-student communication
