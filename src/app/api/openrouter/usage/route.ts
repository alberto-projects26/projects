import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const missionId = searchParams.get('tag');

  // In a real scenario, we'd query OpenRouter usage API with the tag
  // https://openrouter.ai/api/v1/stats
  
  // Simulated cost-by-tag logic:
  // If the tag exists, return a random realistic cost for that missionId
  if (missionId) {
    // Determine a deterministic cost based on missionId hash
    let hash = 0;
    for (let i = 0; i < missionId.length; i++) {
        hash = ((hash << 5) - hash) + missionId.charCodeAt(i);
        hash |= 0;
    }
    const simulatedCost = Math.abs(hash % 150) + (Math.random() * 10);
    
    return NextResponse.json({ 
      missionId,
      total_cost: Number(simulatedCost.toFixed(2)),
      tokens_in: hash % 50000,
      tokens_out: hash % 20000 
    });
  }

  return NextResponse.json({ total_cost: 0 });
}
