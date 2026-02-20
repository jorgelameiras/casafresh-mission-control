# Office View Layout

## Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│                   🏢 OFFICE VIEW                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐                  ┌──────────────┐       │
│   │   Jarvis     │                  │  CodeBot     │       │
│   │   (Green)    │                  │   (Blue)     │       │
│   │              │                  │              │       │
│   │    👨‍💼 💻    │                  │    🤖 💻    │       │
│   │   Active ●   │                  │   Active ●   │       │
│   └──────────────┘                  └──────────────┘       │
│                                                             │
│                  ┌─────────────────┐                       │
│                  │  BREAK ROOM     │                       │
│                  │  (Common Area)  │                       │
│                  │                 │                       │
│                  │    💼  🔍      │  ← Idle agents        │
│                  │  (BizBot,      │     gather here       │
│                  │   ReviewBot)    │                       │
│                  └─────────────────┘                       │
│                                                             │
│   ┌──────────────┐                  ┌──────────────┐       │
│   │ ReviewBot    │                  │   BizBot     │       │
│   │   (Gold)     │                  │ (Lt. Green)  │       │
│   │              │                  │              │       │
│   │     🪑       │  ← Empty         │     🪑       │       │
│   │   Idle ○     │    (at break)    │   Idle ○     │       │
│   └──────────────┘                  └──────────────┘       │
│                                                             │
│   ● Active  ○ Idle  ○ Offline                             │
└─────────────────────────────────────────────────────────────┘
```

## Desk Positions

### Top Row
- **Top-Left (10%, 10%):** Jarvis - Main operations agent
- **Top-Right (60%, 10%):** CodeBot - Development agent

### Bottom Row  
- **Bottom-Left (10%, 65%):** ReviewBot - Code review agent
- **Bottom-Right (60%, 65%):** BizBot - Business operations agent

### Center
- **Common Area (35%, 37.5%):** Break room where idle agents gather

## Visual States

### Active Agent 🟢
```
┌──────────────┐
│   Jarvis     │
│  (Active)    │
│              │
│    👨‍💼       │ ← Character at desk
│    💻        │ ← Glowing monitor
│   [●]        │ ← Pulsing green dot
└──────────────┘
```

### Idle Agent 🟡
```
┌──────────────┐         ┌─────────────────┐
│ ReviewBot    │         │  BREAK ROOM     │
│  (Idle)      │         │                 │
│              │    ──▶  │      🔍         │ ← Character moved here
│     🪑       │         │  (floating)     │    (animated)
│   [○]        │         └─────────────────┘
└──────────────┘
     Empty desk
```

### Offline Agent ⚫
```
┌──────────────┐
│   BizBot     │
│ (Offline)    │
│              │
│    👻 💼     │ ← Dimmed/transparent
│    💤        │ ← Inactive monitor
│   [○]        │ ← Gray dot
└──────────────┘
```

## Animations

### Character Animations
- **Active:** `animate-typing` - Subtle bounce (working at desk)
- **Idle:** `animate-float` - Floating up/down (standing in break room)
- **Moving:** Smooth 700ms transition between desk and common area

### Monitor Effects
- **Active:** Pulsing glow effect matching agent color
- **Idle/Offline:** Dark screen, no glow

### Interaction States
- **Hover:** Desk scales to 105%, shows message tooltip
- **Click:** Opens detailed modal with full agent info
- **Status Change:** Smooth color transition, optional sound notification

## Color Coding

| Agent      | Color      | Hex       | Status Indicator |
|------------|------------|-----------|------------------|
| Jarvis     | Green      | `#63D866` | 🟢              |
| CodeBot    | Blue       | `#3A7BC8` | 🔵              |
| ReviewBot  | Gold       | `#B49A60` | 🟡              |
| BizBot     | Lt. Green  | `#9AED9C` | 🟢              |

## Interactive Features

### Desk Hover
Shows tooltip with:
- Agent last message preview
- Timestamp
- Current status

### Desk Click
Opens modal with:
- 🎭 Large character avatar
- 📝 Full last message
- 🕐 Last activity timestamp
- 📄 Session file name
- 🚦 Current status

### Background
- Subtle grid pattern (opacity 10%)
- Dark gradient (gray-900 → gray-800 → gray-900)
- Gives depth to the office space

## Responsive Behavior

### Desktop (>1024px)
- Full 4-desk layout
- Common area in center
- All controls visible

### Tablet (768px - 1024px)
- Same layout, smaller desks
- Reduced spacing
- Some controls hidden

### Mobile (<768px)
- Simplified layout
- Stacked elements
- Touch-friendly interactions

## Real-time Updates

- **Polling:** Every 5 seconds
- **Status Detection:** Automatic via API
- **Animation Triggers:** 
  - Desk → Common area when going idle
  - Common area → Desk when becoming active
  - Fade to transparent when going offline
  - Fade to full opacity when coming online

---

**Layout Philosophy:** The office metaphor makes agent status immediately intuitive - you can "see" who's working at their desk, who's taking a break, and who's offline, just like walking through a real office!
