import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { NextResponse } from 'next/server';

function extractJSON(output: string): any {
  const lastBrace = output.lastIndexOf('{');
  const lastBracket = output.lastIndexOf('[');
  const startIdx = Math.max(lastBrace, lastBracket);
  if (startIdx === -1) return null;
  try {
    return JSON.parse(output.slice(startIdx));
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    let sessions: any[] = [];
    try {
      // Direct file read for speed and reliability
      const fileData = readFileSync('/Users/jarvis/.openclaw/agents/main/sessions/sessions.json', 'utf-8');
      const parsed = JSON.parse(fileData);
      
      // Handle both {sessions: [...]} and raw array formats
      if (parsed.sessions) {
        sessions = parsed.sessions;
      } else if (Array.isArray(parsed)) {
        sessions = parsed;
      } else if (typeof parsed === 'object') {
        // Handle object with session entries
        sessions = Object.entries(parsed).map(([key, value]: [string, any]) => ({
          key,
          ...value
        }));
      }
    } catch (e) {
      // Fallback to CLI if file read fails
      const output = execSync('openclaw sessions list 2>&1', { encoding: 'utf-8', timeout: 5000 });
      const parsed = extractJSON(output);
      if (parsed?.sessions) {
        sessions = parsed.sessions;
      } else if (Array.isArray(parsed)) {
        sessions = parsed;
      }
    }

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json({ agents: [], source: 'empty' });
    }
    
    const agents = sessions.map((session: any) => ({
      id: session.key || session.sessionId || 'unknown',
      name: session.label || session.displayName || session.subject || session.key?.split(':').pop() || 'Agent',
      status: session.updatedAt && (Date.now() - session.updatedAt < 300000) ? 'active' : 'idle',
      model: session.model || 'auto',
      provider: session.modelProvider || 'openrouter',
      tokensIn: session.inputTokens || 0,
      tokensOut: session.outputTokens || 0,
      costToday: 0,
      uptime: session.ageMs ? `${Math.floor(session.ageMs / 60000)}m` : '0m',
      lastActivity: session.updatedAt ? new Date(session.updatedAt).toLocaleTimeString() : 'Unknown',
    }));
    
    return NextResponse.json({ agents, source: 'real', count: agents.length });
  } catch (error: any) {
    console.error('OpenClaw fetch failed:', error.message);
    return NextResponse.json({ agents: [], error: error.message, source: 'error' });
  }
}
