# Mission Control Development Workflow

## 🔄 Development → Production Pipeline

### 1. Standard Git Workflow (Recommended)

```bash
# Pull latest changes before starting
git pull origin main

# Create a feature branch
git checkout -b feature/new-dashboard-widget

# Develop locally with hot reload
npm run dev

# Test at http://localhost:3000

# Commit your changes
git add .
git commit -m "Add new widget with X functionality"

# Merge back to main
git checkout main
git merge feature/new-dashboard-widget
git push origin main

# Deploy to production
./scripts/deploy.sh
```

### 2. Feature Development Cycle

**Phase 1: Sketch**
- Create Mockup or describe feature in `docs/ideas.md`
- Assign to milestone (v1.1, v1.2, etc.)

**Phase 2: Develop**
```bash
git checkout -b feature/<name>
npm run dev
# Build your feature
```

**Phase 3: Test**
```bash
# Build production version locally
npm run build  
npm start
# Verify at http://localhost:3000
```

**Phase 4: Deploy**
```bash
git checkout main
git merge feature/<name>
./scripts/deploy.sh
```

### 3. Zero-Downtime Updates

PM2 handles graceful reloading:

```bash
# Option A: Full redeploy (includes build)
./scripts/deploy.sh

# Option B: Quick reload (for code changes only)
git pull origin main
npm run build
pm2 reload mission-control  # Zero downtime!
```

### 4. Staging Environment (Optional)

Test before going live:

```bash
# Terminal 1: Production (port 3000)
pm run dev

# Terminal 2: Staging (port 3001)  
PORT=3001 npm run dev

# Access staging at http://mac-mini:3001
# Verify works, then deploy to port 3000
```

### 5. Idea & Feature Tracking

Keep ideas organized in your workspace:

**Option A: GitHub Issues**
- Use GitHub to track bugs and features
- Link commits: `Fixes #42 - Add chart widget`

**Option B: Local Ideas File**
Create `docs/ROADMAP.md`:
```markdown
## V1.1 Ideas
- [ ] Dark/Light theme toggle
- [ ] Mobile-responsive layout
- [ ] Voice command integration

## V1.2 Ideas  
- [ ] Real-time cost alerts
- [ ] Agent performance analytics
- [ ] Mission export to PDF
```

**Option C: Mission Control Tasks**
- Use the app itself! Create a "Development" mission
- Track features as tasks in your own dashboard

### 6. Database/State Considerations

**Current State:**
- No database (uses localStorage + file reads)
- Configuration in `.env.local`
- PM2 handles process persistence

**If you add a database later:**
```bash
# Backup before updates
pg_dump mission_control > backup-$(date +%Y%m%d).sql

# Migrations (if using Prisma/TypeORM)
npx prisma migrate deploy
```

### 7. Hotfixes (Emergency Patches)

For urgent fixes to production:

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# Fix the issue
# test quickly

# Deploy immediately
git commit -am "HOTFIX: Resolve critical issue"
git checkout main
git merge hotfix/critical-bug
./scripts/deploy.sh
```

### 8. Rollback (If Something Breaks)

```bash
# Go back to previous version
git log --oneline  # Find last working commit
git checkout <commit-hash>
./scripts/deploy.sh

# Or use PM2 to restart previous version
pm2 restart mission-control --name mission-control-backup
```

## 📋 Quick Reference Commands

| Task | Command |
|------|---------|
| Start dev | `npm run dev` |
| Build production | `npm run build` |
| Deploy | `./scripts/deploy.sh` |
| Check logs | `pm2 logs mission-control` |
| Restart prod | `pm2 reload mission-control` |
| View status | `pm2 list` |
| Stop prod | `pm2 stop mission-control` |

## 🎯 Best Practices

1. **Always test locally** before deploying
2. **Commit often** during development
3. **Use descriptive commit messages** 
4. **Create branches** for features, not direct main commits
5. **Backup .env.local** before major changes
6. **Monitor logs** after deployment (`pm2 logs`)
7. **Keep Tailscale running** for remote access

## 🚀 Release Checklist

Before deploying a new version:

- [ ] Tests pass locally
- [ ] No hardcoded secrets in code
- [ ] .env.local has all required vars
- [ ] Git committed and pushed
- [ ] Backup current production (optional)
- [ ] Deploy script runs without errors
- [ ] App accessible at tailscale URL
- [ ] PM2 shows "online" status
- [ ] Logs show no critical errors

---

**Remember:** Your production app is on your Mac mini (localhost:3000) and accessible via Tailscale. The GitHub repo is your source of truth for code.
