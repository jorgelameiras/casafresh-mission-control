# CasaFresh Mission Control

Internal operations dashboard — live agent activity, business snapshot, and task history.

## Setup

```bash
cd /Users/jarvis/.openclaw/workspace-coder/mission-control
npm install
npm run dev
```

## Access

- **Local:** http://localhost:3000
- **Network (from phone):** http://\<mac-mini-ip\>:3000
  - Find IP: System Settings → Network → Wi-Fi → IP Address

## Stack

- Next.js 15 (App Router)
- Tailwind CSS (dark theme)
- TypeScript
- React 19
- Polls every 5s — no WebSocket needed

## Data Sources

| Widget | Source |
|---|---|
| Agent Status | `/Users/jarvis/.openclaw/agents/*/sessions/*.jsonl` |
| Live Activity | All JSONL files modified in last 24h |
| Business Snapshot | `workspace-main/properties.md`, `workspace-business/leads.md`, etc. |

## Agent Colors

| Agent | Color |
|---|---|
| Jarvis | `#63D866` (lime green) |
| CodeBot | `#3A7BC8` (blue) |
| ReviewBot | `#B49A60` (gold) |
| BizBot | `#9AED9C` (mint) |

## Status Logic

- **Active** — last message < 5 minutes ago
- **Idle** — last message < 30 minutes ago  
- **Offline** — no recent activity

## Notes

- CORS is open (`*`) on API routes — intentional for local network phone access
- Fonts loaded from Google Fonts CDN; falls back to system-ui if offline
