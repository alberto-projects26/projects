import { NextRequest, NextResponse } from 'next/server';

// Store for active assignments (in-memory for now)
let activeAssignments: Record<string, string> = {};

export function setMissionAssignment(agentId: string, missionId: string | null) {
  if (missionId) {
    activeAssignments[agentId] = missionId;
  } else {
    delete activeAssignments[agentId];
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model, agentId } = body;
    
    // Get mission assignment for this agent
    const missionId = agentId ? activeAssignments[agentId] : null;
    
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': request.headers.get('origin') || 'http://localhost:3000',
        'X-Title': 'Mission Control',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-4-turbo',
        messages,
        metadata: missionId ? { mission_id: missionId } : undefined,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'OpenRouter API error' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
