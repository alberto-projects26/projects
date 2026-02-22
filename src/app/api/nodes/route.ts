import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get real node status from OpenClaw
    const output = execSync('openclaw nodes status --json 2>/dev/null || echo "[]"', { 
      encoding: 'utf-8',
      timeout: 5000 
    });
    
    const nodes = JSON.parse(output);
    
    // Transform to our format
    const formattedNodes = nodes.map((node: any) => ({
      id: node.id || node.deviceId,
      name: node.displayName || node.name || 'Unknown Node',
      type: node.platform || 'unknown',
      status: node.connected ? 'online' : 'offline',
      battery: node.batteryLevel,
      lastSeen: node.lastSeen ? new Date(node.lastSeen).toLocaleString() : 'Unknown',
      capabilities: node.capabilities || [],
      location: node.location,
    }));
    
    return NextResponse.json({ nodes: formattedNodes, source: 'real' });
  } catch (error) {
    console.log('Node data unavailable:', error);
    return NextResponse.json({ 
      nodes: [],
      error: 'OpenClaw nodes not available',
      source: 'error'
    });
  }
}