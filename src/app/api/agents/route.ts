import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check OpenClaw status first
    const statusOutput = execSync('openclaw status 2>&1 || echo "not-running"', {
      encoding: 'utf-8',
      timeout: 3000
    });
    
    if (statusOutput.includes('not-running') || statusOutput.includes('stopped')) {
      console.log('OpenClaw gateway not running');
      throw new Error('OpenClaw not running');
    }

    // Try to get real session data from OpenClaw
    const output = execSync('openclaw sessions list -k default,cron --json 2>/dev/null', { 
      encoding: 'utf-8',
      timeout: 8000 
    });
    
    const sessions = JSON.parse(output || '[]');
    
    if (!Array.isArray(sessions) || sessions.length === 0) {
      console.log('No active sessions found');
      throw new Error('No sessions');
    }
    
    // Transform to agent format with cost tracking
    const agents = await Promise.all(sessions.map(async (session: any) => {
      const sessionKey = session.sessionKey || session.id || 'unknown';
      
      // Get cost data if available
      let costToday = 0;
      try {
        const costOutput = execSync(`openclaw sessions status ${sessionKey} 2>/dev/null || echo "{}"`, {
          encoding: 'utf-8',
          timeout: 2000
        });
        const costData = JSON.parse(costOutput);
        costToday = costData.cost || costData.tokens?.cost || 0;
      } catch {}
      
      return {
        id: sessionKey,
        name: session.label || session.agentId || 'Agent ' + sessionKey.slice(-4),
        status: session.activeMinutes && session.activeMinutes < 30 ? 'active' : 'idle',
        model: session.model || 'auto',
        provider: session.provider || 'openrouter',
        tokensIn: session.tokensPrompt || 0,
        tokensOut: session.tokensCompletion || 0,
        costToday: costToday,
        uptime: session.activeMinutes ? 
          `${Math.floor(session.activeMinutes / 60)}h ${session.activeMinutes % 60}m` : 
          'just started',
        lastActivity: session.lastMessageAt ? 
          new Date(session.lastMessageAt).toLocaleTimeString() : 
          'Unknown',
      };
    }));
    
    return NextResponse.json({ 
      agents, 
      source: 'real',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.log('OpenClaw fetch failed:', error.message);
    return NextResponse.json({ 
      agents: [],
      error: error.message || 'OpenClaw unavailable',
      source: 'error'
    }, { status: 200 }); // Return 200 so UI can handle gracefully
  }
}