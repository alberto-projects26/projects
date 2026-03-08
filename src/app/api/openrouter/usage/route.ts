import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get('tag');

  // For real OpenRouter integration:
  // 1. Import your OPENROUTER_API_KEY from env
  // 2. Query: https://openrouter.ai/api/v1/stats?tag=mission_id:${missionId}
  
  // Simulated data for demo (deterministic based on missionId hash)
  if (missionId) {
    let hash = 0;
    for (let i = 0; i < missionId.length; i++) {
        hash = ((hash << 5) - hash) + missionId.charCodeAt(i);
        hash |= 0;
    }
    const baseCost = Math.abs(hash % 250) + 50; // $50-300 range
    
    return NextResponse.json({ 
      missionId,
      total_cost: Number(baseCost.toFixed(2)),
      tokens_prompt: Math.abs(hash * 100) % 50000,
      tokens_completion: Math.abs(hash * 40) % 20000,
      requests: Math.abs(hash % 50) + 5,
      status: 'active',
      last_updated: new Date().toISOString()
    });
  }

  return NextResponse.json({ total_cost: 0, status: 'no_tag' });
}
