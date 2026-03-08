#!/bin/bash
# Mission Control Production Deployment Script

set -e

echo "🚀 Starting Mission Control deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this from the project root.${NC}"
    exit 1
fi

# Install PM2 globally if not present
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️ PM2 not found. Installing...${NC}"
    npm install -g pm2
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --production

# Create logs directory
mkdir -p logs

# Copy environment file if not exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️ .env.local not found. Copying from template...${NC}"
    cp .env.local.example .env.local 2>/dev/null || echo "# Production environment" > .env.local
fi

# Build the production app
echo -e "${YELLOW}🔨 Building production app...${NC}"
npm run build

# Stop existing PM2 process if running
echo -e "${YELLOW}🛑 Stopping existing process (if any)...${NC}"
pm2 delete mission-control 2>/dev/null || true

# Start with PM2
echo -e "${YELLOW}▶️  Starting with PM2...${NC}"
pm2 start ecosystem.config.js

# Save PM2 config to restart on boot
echo -e "${YELLOW}💾 Saving PM2 config...${NC}"
pm2 save

# Setup PM2 startup script
echo -e "${YELLOW}⚙️  Setting up PM2 startup...${NC}"
pm2 startup | grep -v "PM2" | bash || true

echo -e "${GREEN}✅ Mission Control deployed successfully!${NC}"
echo ""
echo -e "${GREEN}📊 App Status:${NC}"
pm2 list

echo ""
echo -e "${GREEN}🌐 Access URLs:${NC}"
echo "  Local:    http://localhost:3000"
echo "  Tailscale: http://albertos-mac-mini.local:3000"
echo ""
echo -e "${YELLOW}📋 Useful commands:${NC}"
echo "  View logs:     pm2 logs mission-control"
echo "  Restart:       pm2 restart mission-control"
echo "  Stop:          pm2 stop mission-control"
echo "  Monitor:       pm2 monit"
