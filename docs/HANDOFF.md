# Mission Control V2 - Handoff Document for Claude Code

## Project Overview

**Mission Control V2** is a Next.js 16 dashboard for managing OpenClaw agents, nodes, and missions. Built with a strict local-first design philosophy and clean separation of concerns.

**Location:** `/Users/jarvis/.openclaw/workspace/mission-control-v2/`

---

## Architecture Summary

The project follows a **layered architecture** with clear separation:

```
src/
├── app/                    # Next.js App Router (empty, fresh)
├── components/             # UI components (empty folders)
│   ├── ui/                # Base components (Button, Input, etc.)
│   ├── layout/            # Layout (Sidebar, Header)
│   └── features/          # Feature components
├── hooks/                 # React hooks (empty)
├── lib/                   # Utilities (empty)
├── services/              # External service adapters
│   └── openclaw/
│       └── adapter.ts     # ✅ IMPLEMENTED: OpenClaw adapter
├── stores/                # State management (empty)
└── types/
    └── openclaw.ts        # ✅ IMPLEMENTED: Type definitions
```

### Core Principles

1. **Local-First**: Works without OpenClaw Gateway using mock data
2. **Adapter Pattern**: Clean abstraction layer for external services
3. **TypeScript Strict Mode**: Full type safety
4. **Test-Driven**: Tests from the beginning
5. **Separation of Concerns**: Clear boundaries between layers

---

## File Inventory

### Core Implementation Files

| File | Purpose |
|------|---------|
| `src/services/openclaw/adapter.ts` | **Main implementation**: OpenClaw adapter with mock + HTTP implementations |
| `src/types/openclaw.ts` | TypeScript type definitions for all OpenClaw entities |
| `tests/openclaw-adapter.test.ts` | Unit tests for the adapter (11 tests) |
| `tests/setup.ts` | Vitest test setup with jest-dom |
| `vitest.config.ts` | Vitest configuration |
| `docs/SPEC.md` | Technical specification and architecture docs |

### Standard Next.js Files (Unmodified)

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript config with strict mode |
| `next.config.ts` | Next.js config |
| `src/app/layout.tsx` | Root layout (default) |
| `src/app/page.tsx` | Home page (default) |
| `src/app/globals.css` | Global styles (Tailwind) |

---

## OpenClaw Adapter Design

### Interface (`IOpenClawAdapter`)

```typescript
interface IOpenClawAdapter {
  // Connection
  connect(): Promise<boolean>;
  disconnect(): void;
  getStatus(): AdapterStatus;
  
  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  spawnAgent(config: AgentSpawnConfig): Promise<Agent>;
  
  // Nodes
  getNodes(): Promise<Node[]>;
  getNode(id: string): Promise<Node | null>;
  
  // Sessions
  getSessions(): Promise<Session[]>;
  
  // Messages
  sendMessage(sessionId: string, content: string): Promise<Message>;
}
```

### Implementation Status

| Feature | Mock | HTTP (Real) |
|---------|------|-------------|
| `connect()` | ✅ Returns true | ✅ Pings gateway |
| `disconnect()` | ✅ Sets connected=false | ✅ Sets connected=false |
| `getStatus()` | ✅ Returns status object | ✅ Returns status object |
| `getAgents()` | ✅ Returns 1 mock agent | ✅ Fetches from `/api/agents` |
| `getAgent(id)` | ✅ Finds by ID | ✅ Fetches and filters |
| `spawnAgent()` | ✅ Creates new mock agent | ✅ POSTs to `/api/agents/spawn` |
| `getNodes()` | ✅ Returns empty array | ✅ Fetches from `/api/nodes` |
| `getNode(id)` | ✅ Finds by ID | ✅ Fetches and filters |
| `getSessions()` | ⚠️ Returns empty array | ✅ Fetches from `/api/sessions` |
| `sendMessage()` | ❌ Throws error | ✅ POSTs to `/api/chat` |

### Factory Function

```typescript
// Usage
import { createOpenClawAdapter } from '@/services/openclaw/adapter';

// Local development (uses mock)
const adapter = createOpenClawAdapter('mock');

// Production (uses HTTP)
const adapter = createOpenClawAdapter('http', {
  gatewayUrl: 'http://localhost:8080',
  apiKey: 'optional-key',
  timeout: 10000,
});
```

### Current Mock Data

The mock adapter returns one agent by default:
```typescript
{
  id: 'agent:main:main',
  name: 'Jarvis',
  status: 'active',
  model: 'minimax/minimax-m2.5',
  provider: 'openrouter',
  tokensIn: 68113,
  tokensOut: 2176,
  costToday: 0,
  uptime: '0m',
  lastActivity: '2026-03-07T...'
}
```

---

## Test Coverage

### Existing Tests (11 passing)

| Test | Status |
|------|--------|
| Mock adapter creation | ✅ Pass |
| Connect returns true | ✅ Pass |
| Status is connected after connect | ✅ Pass |
| Disconnect sets connected=false | ✅ Pass |
| Get agents returns array | ✅ Pass |
| Get agent by ID returns agent | ✅ Pass |
| Get unknown agent returns null | ✅ Pass |
| Spawn agent creates new agent | ✅ Pass |
| Get nodes returns empty array | ✅ Pass |
| Factory creates mock by default | ✅ Pass |
| Factory throws without config for HTTP | ✅ Pass |

### Untested Areas

- `OpenClawHttpAdapter` class (needs real/stubbed HTTP)
- UI components (none implemented yet)
- React hooks (none implemented yet)
- Integration with Next.js app

---

## Assumptions & Limitations

1. **No Environment Variables**: The adapter doesn't read from `.env` yet - config must be passed manually
2. **No Real OpenClaw Connection**: HTTP adapter assumes specific API endpoints (`/api/agents`, `/api/nodes`, etc.)
3. **No Authentication**: HTTP adapter supports API key but no session-based auth
4. **No Reconnection Logic**: Doesn't handle connection drops
5. **No Caching**: Every call hits the API (or mock)
6. **No Real-time**: No WebSocket or polling support
7. **Sessions Empty**: `getSessions()` mock returns `[]`
8. **No Node Metrics**: Node type doesn't include system metrics in mock

---

## Proposed Next Steps (Priority Order)

### Phase 1: Foundation (If Not Already Done)
1. Set up basic layout components (Sidebar, Header)
2. Create a React hook to use the adapter (`useOpenClaw.ts`)
3. Add environment variable support for gateway URL

### Phase 2: Core Features
4. Build Dashboard page with agent stats
5. Build Agent list page
6. Build Node monitoring page
7. Add polling/refresh for real-time updates

### Phase 3: Advanced Features
8. Mission management (create, update, delete)
9. Task tracking
10. Action plans with approval workflow
11. Supabase integration for persistence

### Phase 4: Production
12. Authentication (NextAuth or Supabase Auth)
13. Real-time WebSocket sync with OpenClaw
14. Deploy to Vercel

---

## Running the Project

```bash
cd /Users/jarvis/.openclaw/workspace/mission-control-v2

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Key Files to Read First

1. `docs/SPEC.md` - Full technical specification
2. `src/services/openclaw/adapter.ts` - Core adapter implementation
3. `src/types/openclaw.ts` - Type definitions
4. `tests/openclaw-adapter.test.ts` - Test examples

---

## Notes for Claude Code

- The project uses **Tailwind CSS 4** with the new `@theme` syntax
- Next.js 16 with App Router
- TypeScript strict mode is enabled
- Test with `npm test` before committing
- Run `npm run build` to verify production build works
- Follow the folder structure in `docs/SPEC.md`

---

*Last updated: March 7, 2026*
