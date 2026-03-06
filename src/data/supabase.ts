import { supabase } from '../lib/supabase';

export type MissionStatus = 'backlog' | 'planning' | 'active' | 'review' | 'completed';
export type AgentStatus = 'idle' | 'active' | 'busy' | 'retired';
export type NodeStatus = 'online' | 'offline' | 'busy';

export interface Task {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface ActionPlan {
  id: string;
  mission_id: string;
  description: string;
  steps: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  status: MissionStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_agent_id: string | null;
  tasks: Task[];
  action_plans: ActionPlan[];
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  current_mission_id: string | null;
  token_burn_24h: number;
  capabilities: string[];
}

export interface Node {
  id: string;
  name: string;
  type: 'mac-mini' | 'iphone' | 'android' | 'pi';
  status: NodeStatus;
  last_seen: string;
  capabilities: string[];
  location: string;
}

export interface Todo {
  id: string;
  task: string;
  mission_id: string | null;
  bot_id: string | null;
  status: 'pending' | 'completed' | 'planning';
  created_at: string;
}

export async function fetchMissions(): Promise<Mission[]> {
  const { data: missions, error } = await supabase
    .from('missions')
    .select('*, tasks(*), action_plans(*)');
  if (error) throw error;
  return missions || [];
}

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase
    .from('agents')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function fetchNodes(): Promise<Node[]> {
  const { data, error } = await supabase
    .from('nodes')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function fetchTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createMission(mission: Partial<Mission>): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .insert([{ ...mission, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMissionStatus(id: string, status: MissionStatus) {
  const { error } = await supabase
    .from('missions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function createAgent(agent: Partial<Agent>): Promise<Agent> {
  const { data, error } = await supabase
    .from('agents')
    .insert([agent])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateAgentStatus(id: string, status: AgentStatus) {
  const { error } = await supabase
    .from('agents')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function createTodo(todo: Partial<Todo>): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert([{ ...todo, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTodo(id: string, updates: Partial<Todo>) {
  const { error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id);
  if (error) throw error;
}

export async function createActionPlan(plan: Partial<ActionPlan>): Promise<ActionPlan> {
  const { data, error } = await supabase
    .from('action_plans')
    .insert([{ ...plan, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}
