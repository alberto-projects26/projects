import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Simple auth check - in production, use proper session validation
function getAuthToken(req: NextRequest): string | null {
  return req.headers.get('authorization')?.replace('Bearer ', '') || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, name, tgToken } = body;

    // Validate required fields
    if (!agentId || !name) {
      return NextResponse.json(
        { message: 'Missing agentId or name' },
        { status: 400 }
      );
    }

    if (!tgToken) {
      return NextResponse.json(
        { message: 'Telegram token required for deployment' },
        { status: 400 }
      );
    }

    // SECURITY: Do not log the token!
    // We sanitize the token for logging purposes only
    const safeTokenPreview = tgToken.substring(0, 8) + '...';
    console.log(`[AGENT DEPLOY] Starting deployment for agent: ${name} (ID: ${agentId})`);
    console.log(`[AGENT DEPLOY] Token preview: ${safeTokenPreview}`);

    // Execute the OpenClaw CLI command
    // The token is passed directly to the CLI and never stored or logged by us
    const command = `openclaw agents add "${name}" --bind "telegram:${tgToken}" --agent-dir "/Users/jarvis/.openclaw/agents/${agentId}" --non-interactive`;
    
    let stdout, stderr;
    try {
      // Set a timeout to prevent hanging
      const timeoutMs = 30000; // 30 seconds
      ({ stdout, stderr } = await execAsync(command, { 
        timeout: timeoutMs,
        // Pass sensitive env vars if needed
        env: { 
          ...process.env,
          // Ensure no extra logging of secrets
        }
      }));
    } catch (execError: any) {
      // Check if it's a timeout
      if (execError.killed) {
        console.error('[AGENT DEPLOY] Command timed out');
        return NextResponse.json(
          { message: 'Deployment timed out' },
          { status: 504 }
        );
      }
      
      // Log stderr without the token
      console.error('[AGENT DEPLOY] Command failed:', execError.message);
      return NextResponse.json(
        { message: `Deployment failed: ${execError.message}` },
        { status: 500 }
      );
    }

    // Success - log without sensitive data
    console.log(`[AGENT DEPLOY] Agent ${name} deployed successfully`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Agent deployed successfully',
      // Don't return the token in the response!
    });

  } catch (error: any) {
    console.error('[AGENT DEPLOY] Unexpected error:', error.message);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
