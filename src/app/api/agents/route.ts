import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to get real session data from OpenClaw
    const output = execSync('openclaw sessions list --json 2>/dev/null || echo "[]"', { 
      encoding: 'utf-8',
      timeout: 5000 
    });
    
    const sessions = JSON.parse(output);
    
    // Transform to agent format
    const agents = sessions.map((session: any) => ({
      id: session.sessionKey || session.id,
      name: session.agentId || 'Unknown Agent',
      status: session.activeMinutes < 5 ? 'active' : 'idle',
      model: session.model || 'unknown',
      provider: 'OpenRouter',
      tokensIn: session.tokensIn || 0,
      tokensOut: session.tokensOut || 0,
      costToday: 0, // Would need cost API
      uptime: session.activeMinutes ? `${Math.floor(session.activeMinutes / 60)}h ${session.activeMinutes % 60}m` : '0m',
      lastActivity: session.lastMessageAt || 'Unknown',
    }));
    
    return NextResponse.json({ agents, source: 'real' });
  } catch (error) {
    // Fallback to mock data if OpenClaw CLI fails
    console.log('OpenClaw CLI not available, returning mock data');
    return NextResponse.json({ 
      agents: [],
      error: 'OpenClaw CLI not configured',
      source: 'error'
    });
  }
}