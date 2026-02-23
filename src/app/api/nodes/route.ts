import { execSync } from 'child_process';
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
    let nodes: any[] = [];
    try {
      const output = execSync('openclaw nodes status --json 2>&1', { 
        encoding: 'utf-8', 
        timeout: 5000 
      });
      const parsed = extractJSON(output);
      
      if (parsed?.nodes) {
        nodes = parsed.nodes;
      } else if (Array.isArray(parsed)) {
        nodes = parsed;
      }
    } catch (e) {
      console.error('CLI nodes call failed');
    }

    const formattedNodes = nodes.map((node: any) => ({
      id: node.id || node.deviceId || 'unknown',
      name: node.displayName || node.name || 'Remote Node',
      type: node.platform || node.os || 'unknown',
      status: node.connected ? 'online' : 'offline',
      battery: node.batteryLevel || node.battery,
      lastSeen: node.lastSeen ? new Date(node.lastSeen).toLocaleTimeString() : 'Unknown',
      capabilities: node.capabilities || [],
      location: node.location ? {
        lat: node.location.latitude || node.location.lat,
        lng: node.location.longitude || node.location.lng,
        accuracy: node.location.accuracy || 0,
      } : undefined,
    }));
    
    return NextResponse.json({ 
      nodes: formattedNodes, 
      source: 'real',
      count: formattedNodes.length 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      nodes: [], 
      error: error.message, 
      source: 'error' 
    });
  }
}
