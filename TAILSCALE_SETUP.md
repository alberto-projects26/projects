# Tailscale Remote Access Setup

## 1. Install Tailscale on Mac Mini
```bash
# On your Mac Mini:
brew install tailscale
sudo tailscale up
```

## 2. Install Tailscale on Your Devices
- **iPhone**: App Store → "Tailscale"
- **iPad**: App Store → "Tailscale"  
- **Other computer**: tailscale.com/download

## 3. Authorize Devices
```bash
# On each device, run:
sudo tailscale up
# Login with the same account
```

## 4. Start Mission Control
```bash
cd ~/Projects/mission-control
npm run dev
```

## 5. Access From Anywhere
Once connected to Tailscale:
```
http://albertos-mac-mini:3000
```

Or find your Mac Mini's Tailscale IP:
```bash
tailscale ip -4
# Returns something like: 100.x.x.x
# Then use: http://100.x.x.x:3000
```

## 6. Verify Security
- ✅ Tailscale encrypts all traffic (WireGuard)
- ✅ Only your authorized devices can connect
- ✅ Mission Control runs locally (data stays on your Mac Mini)
- ✅ Local authentication layer protects the app

## Troubleshooting

**Can't access from iPhone?**
- Make sure both devices show as "Connected" in Tailscale app
- Check Mac Mini firewall: `sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate`
- Allow port 3000: `sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node`

**Want a custom domain?**
- Use Tailscale Funnel (beta): `sudo tailscale funnel 3000`
- Gets you: https://alberto.tailnet-name.ts.net

**Password not working?**
- Check .env.local exists: `cat ~/Projects/mission-control/.env.local`
- Restart the dev server after changing .env
