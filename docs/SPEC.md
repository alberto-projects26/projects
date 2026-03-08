# Mission Control V2 - Technical Specification

## Project Overview

**Mission Control V2** is a Next.js-based dashboard for managing OpenClaw agents, nodes, and missions. Built with a local-first design philosophy and strict separation of concerns.

## Architecture Principles

1. **Local-First**: Works without OpenClaw Gateway (mock data for development)
2. **Adapter Pattern**: Clean abstraction layer for external services
3. **Strict TypeScript**: Full type safety with strict mode enabled
4. **Test-Driven**: Tests from the beginning
5. **Separation of Concerns**: Clear boundaries between layers

---

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   └── layout.tsx         # Root layout
│
├── components/            # React components
│   ├── ui/               # Base UI components (Button, Input, Card)
│   ├── layout/           # Layout components (Sidebar, Header)
│   └── features/         # Feature-specific components
│
├── hooks/                 # Custom React hooks
│   ├── useOpenClaw.ts    # OpenClaw data fetching
│   └── useLocalStorage.ts
│
├── lib/                   # Utilities
│   ├── config.ts         # Environment config
│   └── utils.ts          # Helper functions
│
├── services/              # External service adapters
│   ├── openclaw/         # OpenClaw Gateway adapter
│   │   ├── adapter.ts    # Main adapter interface
│   │   ├── mock.ts       # Mock implementation
│   │   └── http.ts       # HTTP implementation
│   └── supabase/         # (Future) Supabase adapter
│
├── stores/               # State management
│   └── agentStore.ts     # Agent state (Zustand)
│
└── types/                # TypeScript types
    └── openclaw.ts       # OpenClaw entity types
```

---

## Core Interfaces

### OpenClaw Adapter

```typescript
interface IOpenClawAdapter {
  connect(): Promise<boolean>;
  disconnect(): void;
  getStatus(): AdapterStatus;
  
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | null>;
  
  getNodes(): Promise<Node[]>;
  getNode(id: string): Promise<Node | null>;
  
  getSessions(): Promise<Session[]>;
}
```

### Agent Interface

```typescript
interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'active' | 'busy' | 'retired';
  model: string;
  provider: string;
  tokensIn: number;
  tokensOut: number;
  costToday: number;
  uptime: string;
  lastActivity: string;
}
```

---

## Development Phases

### Phase 1: Foundation (Current)
- [x] Project setup with TypeScript strict mode
- [x] OpenClaw adapter layer (mock + HTTP)
- [x] Type definitions
- [ ] Basic layout components

### Phase 2: Core Features
- [ ] Dashboard page with agent stats
- [ ] Agent list and detail views
- [ ] Node monitoring
- [ ] Real-time updates (polling/WebSocket)

### Phase 3: Advanced Features
- [ ] Mission management
- [ ] Task tracking
- [ ] Action plans with approval workflow

### Phase 4: Production Ready
- [ ] Supabase integration
- [ ] Authentication
- [ ] Real-time WebSocket sync
- [ ] Deploy to Vercel

---

## Testing Strategy

- **Unit Tests**: Individual functions and hooks
- **Component Tests**: React component behavior
- **Integration Tests**: Adapter + API interactions
- **E2E Tests**: Critical user flows

---

## Environment Variables

```env
# OpenClaw Gateway
OPENCLAW_GATEWAY_URL=http://localhost:8080
OPENCLAW_API_KEY=  # Optional

# Supabase (Future)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Notes

- Mock adapter is used when `OPENCLAW_GATEWAY_URL` is not set
- All monetary values are in USD
- Token counts are raw (not formatted)
- Timestamps are ISO 8601 strings
