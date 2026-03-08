-- Mission Control Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Missions table
CREATE TABLE missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'planning', 'active', 'review', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_agent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'busy', 'retired')),
  current_mission_id UUID REFERENCES missions(id),
  token_burn_24h INTEGER DEFAULT 0,
  capabilities TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nodes table
CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mac-mini', 'iphone', 'android', 'pi')),
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy')),
  last_seen TIMESTAMP WITH TIME ZONE,
  capabilities TEXT[] DEFAULT '{}',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todo items table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task TEXT NOT NULL,
  mission_id UUID REFERENCES missions(id),
  bot_id TEXT REFERENCES agents(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'planning')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action Plans table
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  steps TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now since we're using anon key for client-side)
CREATE POLICY "Allow all access" ON missions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON agents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON nodes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON action_plans FOR ALL USING (true) WITH CHECK (true);

-- Insert seed data for missions
INSERT INTO missions (title, description, status, priority) VALUES
  ('Research AI Agents', 'Deep dive into autonomous agent architectures and frameworks', 'active', 'high'),
  ('Setup Gmail Integration', 'Connect assistant email to send morning briefings', 'completed', 'medium'),
  ('Build Mission Control UI', 'Create the command center for agent management', 'planning', 'critical'),
  ('Security Audit', 'Review OpenClaw deployment for vulnerabilities', 'backlog', 'low');

-- Insert seed data for agents
INSERT INTO agents (id, name, role, status, token_burn_24h, capabilities) VALUES
  ('a1', 'Research-1', 'Research & Analysis', 'active', 45000, ARRAY['web-search', 'web-fetch', 'reading-files']),
  ('a2', 'Ops-1', 'Operations & Scheduling', 'active', 12300, ARRAY['cron', 'email', 'telegram']),
  ('a3', 'Dev-1', 'Development', 'idle', 0, ARRAY['exec', 'write-files', 'git']),
  ('a4', 'Monitor-1', 'System Monitoring', 'busy', 8900, ARRAY['health-check', 'logging']);

-- Insert seed data for nodes
INSERT INTO nodes (id, name, type, status, capabilities, location) VALUES
  ('n1', 'Mac Mini (Hub)', 'mac-mini', 'online', ARRAY['exec', 'gateway', 'browser'], 'Home Office'),
  ('n2', 'Alberto''s iPhone', 'iphone', 'online', ARRAY['camera', 'location', 'screen'], 'Mobile'),
  ('n3', 'Pi Gateway', 'pi', 'offline', ARRAY['exec', 'relay'], 'Garage');

-- Insert seed data for todos
INSERT INTO todos (task, mission_id, bot_id, status, created_at) VALUES
  ('Setup Gmail SMTP Utility', (SELECT id FROM missions WHERE title = 'Setup Gmail Integration'), 'a2', 'completed', '2026-03-01T08:00:00Z'),
  ('Configure Keychain Security', (SELECT id FROM missions WHERE title = 'Setup Gmail Integration'), 'a2', 'completed', '2026-03-01T09:00:00Z'),
  ('Build Mission Control Layout', (SELECT id FROM missions WHERE title = 'Build Mission Control UI'), 'a1', 'completed', '2026-03-02T22:00:00Z'),
  ('Implement Mission Kanban Board', (SELECT id FROM missions WHERE title = 'Build Mission Control UI'), 'a1', 'completed', '2026-03-02T22:30:00Z'),
  ('Design Futuristic Dashboard', (SELECT id FROM missions WHERE title = 'Build Mission Control UI'), 'a1', 'completed', '2026-03-03T05:00:00Z'),
  ('Connect Supabase for Persistence', (SELECT id FROM missions WHERE title = 'Build Mission Control UI'), 'a3', 'pending', '2026-03-03T06:00:00Z'),
  ('Implement Real-time Gateway Stream', (SELECT id FROM missions WHERE title = 'Build Mission Control UI'), 'a4', 'pending', '2026-03-03T06:15:00Z'),
  ('Add Sub-Agent Orchestration UI', (SELECT id FROM missions WHERE title = 'Build Mission Control UI'), NULL, 'planning', '2026-03-03T06:30:00Z');
