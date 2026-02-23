import { execSync } from 'child_process';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get real node status from OpenClaw via 'nodes status'
    const output = execSync('openclaw nodes status --json 2>/dev/null', { 
      encoding: 'utf-8',
      timeout: 8000 
    });
    
    const nodes = JSON.parse(output || '[]');
    
    if (!Array.isArray(nodes)) {
      throw new Error('Malformed node response');
    }
    
    // Transform to Mission Control format
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
    console.log('Node fetch failed:', error.message);
    return NextResponse.json({ 
      nodes: [],
      error: 'Nodes unavailable',
      source: 'error'
    });
  }
}