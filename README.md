# Todo List Application

A modern, production-ready todo list application built with Convex backend, Next.js 15 App Router, Tailwind CSS, shadcn/ui components, and Better Auth for authentication.

## Features

- ✅ **Task Management** - Create, update, complete, and archive tasks
- 📁 **Categories** - Organize tasks into customizable categories with colors and icons
- 🎯 **Priorities** - Low, Medium, High, and Urgent priority levels
- 📅 **Due Dates** - Set and track task deadlines
- 🔍 **Search & Filter** - Full-text search and advanced filtering
- 💬 **Comments** - Add notes and comments to tasks
- 📊 **Activity Log** - Complete audit trail of task changes
- 🤖 **AI Assistant** - Get help with task planning and organization (powered by @convex-dev/agent)
- 🔒 **Authentication** - Secure user authentication with Better Auth
- 🛡️ **Rate Limiting** - API protection against abuse
- 🎨 **Modern UI** - Beautiful interface with Tailwind CSS and shadcn/ui

## Architecture

This project follows the **four-layer Convex architecture** (Cleargent Pattern):

1. **Database Layer** (`convex/db/`) - Pure CRUD operations, only place where `ctx.db` is used
2. **Endpoint Layer** (`convex/endpoints/`) - Business logic that composes database operations
3. **Workflow Layer** (`convex/workflows/`) - Durable external service integrations
4. **Helper Layer** (`convex/helpers/`) - Pure utility functions with no database access

## Tech Stack

### Backend
- **Convex** - Serverless backend with real-time subscriptions
- **Better Auth** - Modern authentication with JWT tokens
- **Convex Components**:
  - `@convex-dev/better-auth` - Authentication integration
  - `@convex-dev/rate-limiter` - API rate limiting
  - `@convex-dev/agent` - AI agent orchestration

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Beautiful icon library

## Prerequisites

- **Node.js** 18.x or later
- **pnpm** 8.x or later (recommended) or npm
- **Convex CLI** - Install with: `npm install -g convex`

## Installation

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Convex

```bash
# Login to Convex (first time only)
npx convex login

# Create a new Convex project
npx convex dev --once
```

This will:
- Create a new Convex deployment
- Generate `convex/_generated/` directory
- Display your deployment URL

### 3. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` and fill in the required values:

```bash
# Convex (copy from previous step)
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Better Auth (generate secret)
BETTER_AUTH_SECRET=  # Generate with: openssl rand -base64 32
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI Provider (choose one)
OPENAI_API_KEY=  # Get from https://platform.openai.com/api-keys
# OR
# ANTHROPIC_API_KEY=  # Get from https://console.anthropic.com/settings/keys
```

### 4. Start Development Servers

```bash
# Start both Convex and Next.js
pnpm run dev

# Or start them separately:
# Terminal 1: Convex
pnpm run convex:dev

# Terminal 2: Next.js
pnpm run web:dev
```

The application will be available at:
- **Web App**: http://localhost:3000
- **Convex Dashboard**: https://dashboard.convex.dev

## Component-Specific Setup

### Better Auth Component

Better Auth is pre-configured with:
- Email and password authentication
- JWT tokens with 30-day expiration
- Convex adapter for database storage

**HTTP routes** are configured in `convex/http.ts` to handle authentication requests.

### Rate Limiter Component

API rate limiting is configured to prevent abuse:
- **CREATE operations**: 10 requests/minute with burst capacity of 3
- **UPDATE operations**: 50 requests/minute
- **DELETE operations**: 30 requests/minute

Rate limits are applied per user and automatically enforced on all mutations.

### Agent Component

AI-powered task assistance using OpenAI or Anthropic:
- Natural language task creation
- Task suggestion and prioritization
- Smart categorization

**Requirements**:
- Set either `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` in `.env.local`
- The agent component uses OpenAI GPT-4o-mini by default (configurable in `convex/agent.ts`)

## Database Schema

The application uses a comprehensive schema with:

- **`tasks`** - Main todo items with title, description, priority, status, due dates, and tags
- **`categories`** - Organizational containers with custom colors and icons
- **`taskComments`** - Comments and notes on tasks
- **`taskActivity`** - Complete audit log of task changes
- **`userPreferences`** - Per-user settings (theme, notifications, default views)
- **`threads`** - AI conversation threads
- **`messages`** - Messages within AI threads

All tables are **user-scoped** and include proper indexes for efficient querying.

## Project Structure

```
todo-list-app/
├── convex/                    # Convex backend
│   ├── _generated/           # Auto-generated types (gitignored)
│   ├── db/                   # Database layer (Phase 2)
│   ├── endpoints/            # Endpoint layer (Phase 2)
│   ├── workflows/            # Workflow layer (Phase 2)
│   ├── helpers/              # Helper utilities (Phase 2)
│   ├── auth.ts               # Better Auth configuration
│   ├── http.ts               # HTTP routes
│   ├── schema.ts             # Database schema
│   └── convex.config.ts      # Component configuration
├── apps/
│   └── web/                  # Next.js application (Phase 2)
├── packages/                 # Shared packages (Phase 2)
├── .env.local.example        # Environment variable template
├── .gitignore                # Git ignore rules
├── package.json              # Root package.json
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── README.md                 # This file
```

## Implementation Status

### ✅ Phase 1: Infrastructure (COMPLETE)
- ✅ Database schema with all tables
- ✅ Component configuration (Better Auth, Rate Limiter, Agent)
- ✅ Environment setup
- ✅ Design tokens and component library

### ✅ Phase 2: Core Implementation (COMPLETE)
- ✅ **Database Layer** (`convex/db/`) - CRUD operations for all tables
- ✅ **Endpoint Layer** (`convex/endpoints/`) - Business logic and API endpoints
- ✅ **Helper Layer** (`convex/helpers/`) - Utility functions
- ✅ **Frontend Application** (`apps/web/`) - Next.js UI with dashboard

### 📝 Next Steps (To Complete)
See `IMPLEMENTATION_SUMMARY.md` for detailed next steps:
1. Create authentication pages (sign-in, sign-up)
2. Create task management UI (list, detail, create, edit)
3. Create category management UI
4. Create AI chat interface
5. Create settings page

## Development Scripts

```bash
# Development
pnpm run dev              # Start Convex + Next.js
pnpm run web:dev          # Start Next.js only
pnpm run convex:dev       # Start Convex only

# Build
pnpm run build            # Build Next.js for production

# Setup
pnpm run setup            # Install deps + initialize Convex
```

## Documentation

- **Convex Docs**: https://docs.convex.dev
- **Better Auth Docs**: https://better-auth.com
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui Docs**: https://ui.shadcn.com
- **Tailwind CSS Docs**: https://tailwindcss.com/docs

## Design System

The application uses a custom theme based on ReUI + shadcn:

- **Tone**: Neutral
- **Density**: Balanced
- **Primary Color**: #6366f1 (Indigo)
- **Secondary Color**: #0ea5e9 (Sky Blue)
- **Accent Color**: #f97316 (Orange)
- **Font**: Inter with Plus Jakarta Sans for headings

## License

MIT
