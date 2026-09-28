# LOOP — AI Customer Feedback Intelligence Platform

LOOP is a multi-tenant customer-feedback intelligence platform built for the Zidio Development Web Development track. It brings feedback into one workspace, classifies it with AI, surfaces themes and trends, and provides grounded answers and Voice-of-Customer reports.

## Live application

Production: https://loop-ai-v2-0-fmqadf4nf-yashkumavat404.vercel.app

## Core capabilities

- Multi-tenant workspaces with server-side workspace isolation
- Role-based access: ADMIN, ANALYST, VIEWER
- Manual feedback ingestion
- CSV bulk import with row-level validation results
- Simulated support-channel ingestion
- Inbox search, filtering, pagination and status workflow
- Dashboard with real feedback volume, sentiment and theme analytics
- AI sentiment and feature-area classification
- AI-assisted theme assignment and trend analysis
- Ask LOOP with semantic retrieval and grounded feedback citations
- Voice-of-Customer report generation
- Saved reports and PDF export
- Light and dark application themes
- Responsive product interface

## Architecture

Browser
→ Next.js App Router
→ authenticated API route handlers
→ RBAC + workspace scoping
→ Prisma
→ PostgreSQL / pgvector

AI processing runs server-side. Feedback is retrieved before Ask LOOP generates an answer, and generated source IDs are restricted to retrieved feedback.

## Technology

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth.js
- Zod
- Google Gemini API
- pgvector
- Recharts
- pdf-lib
- Vercel

## Local setup

### Requirements

- Node.js 24+
- PostgreSQL database with pgvector support
- Gemini API key
- Git

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and provide:

```env
DATABASE_URL=
AUTH_SECRET=
AI_PROVIDER=gemini
GEMINI_API_KEY=
```

Never commit `.env` or production secrets.

### Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

Seed the demo workspace:

```bash
npm run db:seed
```

### Development

```bash
npm run dev
```

Open http://localhost:3000.

## Demo roles

The seeded demo workspace contains:

- ADMIN — full workspace management and feedback actions
- ANALYST — feedback and analytics operations
- VIEWER — read-only access

Demo credentials are intended for the project demonstration environment only. Do not reuse them for personal accounts or production systems.

## Security and tenancy

Every API operation that reads or changes tenant-owned feedback, themes, reports or users resolves the authenticated user's workspace and scopes the database query to that workspace.

Role checks are enforced server-side. Client-side visibility is not treated as an authorization boundary.

AI API keys remain server-side and are never exposed through `NEXT_PUBLIC_*` environment variables.

## Project structure

```text
app/
  (auth)/          Authentication pages
  (app)/           Protected application pages
  api/             Server-side route handlers

components/
  charts/          Analytics charts
  feedback/       Feedback UI
  layout/         Sidebar, topbar and application shell
  ui/              Reusable interface components

lib/
  ai/              Classification, embeddings and AI providers
  api.ts           Client API helpers
  auth.ts          Auth.js configuration
  auth-helpers.ts  Server authorization helpers
  db.ts            Prisma database client
  search.ts        Workspace-scoped semantic retrieval

prisma/
  schema.prisma    Database schema
  seed.ts          Demo data seed
```

## AI design

### Classification

New feedback is sent to the configured AI provider with the workspace's existing themes as context. The response is validated with Zod before classification data is stored.

### Semantic retrieval

Feedback embeddings are stored in PostgreSQL using pgvector. Ask LOOP performs workspace-scoped similarity retrieval before generating an answer.

### Reports

Reports precompute factual statistics and feedback quotes first. The AI produces the narrative from those prepared facts rather than inventing numerical results.

## Production notes

The application is deployed through Vercel with PostgreSQL and server-side Gemini credentials. Production environment variables must be configured in the deployment platform and must not be committed to Git.

## Scope

LOOP follows the supplied Zidio project brief. The implementation intentionally keeps the required product scope focused rather than adding unrelated features.
