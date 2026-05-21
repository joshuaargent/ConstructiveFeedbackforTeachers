# Constructive Feedback for Teachers

A platform for students to share constructive feedback with teachers, designed to protect against reputational harm and content that could get the site banned.

## Purpose

- Help teachers receive useful, actionable feedback from students
- Protect the platform from content that could lead to bans (hatespeech, threats, personal attacks)
- Aggregate feedback into summaries so teachers don't see individual comments

## How It Works

1. **Student submits feedback** → AI moderates it
2. **Auto-approve**: Only truly constructive feedback is automatically included in summaries
3. **Manual review**: Everything else (neutral, insulting, other) requires manual approval
4. **Aggregated summary**: Teachers see AI-generated themes, never individual feedback

### Auto-Approval Criteria

Feedback must be **specific** AND **actionable**:

```
constructive: "too fast" - valid concern ✓
constructive: "great explanations" - specific praise ✓
constructive: "more examples would help" - actionable ✓

neutral: "boring" - too vague
neutral: "okay" - too brief  

insulting: "teacher is worthless" - personal attack
insulting: "good but he's lazy" - mixed (one bad = insulting)
```

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth.js |
| AI | OpenRouter (Nemotron 3 Super, Nemotron Nano) |

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

## AI Models

Uses OpenRouter with 3-tier fallback:
1. NVIDIA Nemotron 3 Super 120B
2. NVIDIA Nemotron Nano 9B
3. openrouter/free (ultimate fallback)

## Safety Features

- **Mixed feedback blocked**: "good but he's lazy" = insulting (manual review)
- **Individual feedback hidden**: Teachers only see summaries
- **Conservative auto-approve**: Only constructive = auto-show
- **AI falls back safely**: On error, defaults to manual review

## License

MIT
