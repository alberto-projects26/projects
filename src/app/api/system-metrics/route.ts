import { NextResponse } from 'next/server';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsage = usedMem / totalMem;

    const totalMemGB = Math.round(totalMem / (1024 * 1024 * 1024));
    const usedMemGB = Math.round(usedMem / (1024 * 1024 * 1024) * 10) / 10;
    const freeMemGB = Math.round(freeMem / (1024 * 1024 * 1024) * 10) / 10;

    // Get top processes on macOS
    let topProcesses: any[] = [];
    try {
      const { stdout } = await execAsync('ps -eo comm,%cpu,%mem,rss -r | head -7 | tail -6');
      const lines = stdout.trim().split('\n').filter(l => l.trim());
      topProcesses = lines.slice(0, 5).map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 4) {
          const rssKB = parseInt(parts[parts.length - 1], 10);
          const memMB = Math.round(rssKB / 1024);
          return {
            name: parts[0] || 'unknown',
            cpu: parts[parts.length - 3] || '0',
            mem: parts[parts.length - 2] || '0',
            memMB: memMB
          };
        }
        return null;
      }).filter(Boolean);
    } catch (e) {
      // ps failed, continue without processes
    }

    return NextResponse.json({
      cpu: Math.min(Math.round(cpuUsage * 100), 100),
      mem: Math.round(memUsage * 100),
      totalMemGB,
      usedMemGB,
      freeMemGB,
      topProcesses
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
