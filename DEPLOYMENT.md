# Mission Control Production Deployment

## Prerequisites

- macOS/Linux with Node.js 18+
- PM2 installed globally: `npm install -g pm2`
- OpenClaw Gateway running locally
- Tailscale configured (for remote access)

## Quick Deploy

```bash
# 1. Navigate to project
cd ~/Projects/mission-control

# 2. Set your admin password (change this!)
export ADMIN_PASSWORD=your-secure-password

# 3. Run deployment script
./scripts/deploy.sh
```

## Manual Deployment

### 1. Install Dependencies
```bash
npm ci --production
```

### 2. Configure Environment
```bash
# Copy and edit environment
cp .env.local .env.local.production
nano .env.local.production
```

Required vars:
- `ADMIN_PASSWORD` - Your secure password
- `OPENROUTER_API_KEY` - For cost tracking (optional)

### 3. Build Production App
```bash
npm run build
```

### 4. Start with PM2
```bash
pm2 start ecosystem.config.js

# Save config to auto-start on boot
pm2 save
pm2 startup
```

## Monitoring & Management

```bash
# View app status
pm2 list

# View logs in real-time
pm2 logs mission-control

# Restart app
pm2 restart mission-control

# Stop app
pm2 stop mission-control

# Monitor resources
pm2 monit
```

## HTTPS Setup (Optional)

### Option A: Tailscale HTTPS
```bash
# Enable HTTPS on your Tailscale network
tailscale serve https / http://localhost:3000
```

### Option B: Caddy Reverse Proxy
```bash
# Install Caddy
brew install caddy

# Create Caddyfile
cat > Caddyfile << 'EOF'
mission-control.your-domain.com
reverse_proxy localhost:3000
tls internal
EOF

# Run Caddy
caddy run
```

## Firewall Configuration

Allow incoming connections on port 3000:

```bash
# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node

# Or disable firewall for local network
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs mission-control --lines 50

# Check OpenClaw status
openclaw status
```

### Can't access from other devices
```bash
# Verify server is listening on all interfaces
lsof -i :3000

# Should show: *:3000 (LISTEN)
# If not, check HOST=0.0.0.0 in config
```

### PM2 startup not working
```bash
# Re-run startup script
pm2 unstartup
pm2 startup
```

## Updates

To update Mission Control after code changes:

```bash
# Pull latest code
git pull origin main

# Re-run deploy
./scripts/deploy.sh
```

## Backup

Important files to backup:
- `.env.local` - Your configuration
- `sessions/` - Any local session data
- PM2 logs in `logs/` directory

```bash
# Backup command
tar -czf mission-control-backup-$(date +%Y%m%d).tar.gz .env.local logs/
```
