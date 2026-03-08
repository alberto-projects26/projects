module.exports = {
  apps: [{
    name: 'mission-control',
    script: 'npm',
    args: 'start',
    cwd: '/Users/jarvis/Projects/mission-control',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'missioncontrol2025',
    },
    // Auto-restart policy
    max_restarts: 10,
    min_uptime: '10s',
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.next'],
    // Resource limits
    max_memory_restart: '500M',
    // Zero-downtime reload
    wait_ready: true,
    listen_timeout: 5000,
    kill_timeout: 5000,
  }],
};