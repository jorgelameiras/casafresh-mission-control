# CasaFresh Mission Control - User Guide

## 🎯 Quick Start

### Opening the Dashboard
```bash
cd /Users/jarvis/Projects/CasaFresh/mission-control
npm run dev
```
Then open: **http://localhost:3000**

---

## 🧭 Navigation

### Sidebar Menu
The left sidebar is your main navigation hub:

| Icon | View | What You'll See |
|------|------|-----------------|
| 🏢 | **Office** | Live agent workspace (default view) |
| 📊 | **Analytics** | Business metrics, charts, and agent performance |
| 📝 | **Activity** | Real-time activity feed and task history |
| 💾 | **Memory** | Business context and agent memory files |
| ⚙️ | **Settings** | Sound notifications and system info |

**Click any item** to switch views instantly.

---

## 🏢 Office View (Home)

### What You See
A virtual office with 4 agent desks positioned in corners:
- **Top-left:** Jarvis (green)
- **Top-right:** CodeBot (blue)
- **Bottom-left:** ReviewBot (gold)
- **Bottom-right:** BizBot (light green)

**Center:** Break room where idle agents hang out

### Agent Status Indicators

| Status | Visual Cue |
|--------|-----------|
| 🟢 **Active** | Desk glows with agent color, character at desk typing, pulsing monitor |
| 🟡 **Idle** | Character moves to break room (center), empty chair at desk |
| ⚫ **Offline** | Character at desk but faded/grayscale, no glow |

### Interactions
- **Hover over desk:** See agent's last message in a tooltip
- **Click on desk:** Open detailed modal with session info
- **Click background:** Close any open modals

### Legend (Bottom-left)
Shows status color meanings:
- Green dot = Active
- Amber dot = Idle
- Gray dot = Offline

---

## 📊 Analytics View

### Sections
1. **Business Snapshot Bar** (top)
   - Leads, Properties, Ideas, Memory Files
   - Last log entry preview

2. **Charts** (middle, 2 columns)
   - **Agent Timeline:** Activity over time per agent
   - **Workload Chart:** Message distribution

3. **System Health** (bottom)
   - Server status and uptime

---

## 📝 Activity View

### Two Columns
1. **Activity Feed** (left)
   - Real-time agent messages
   - Color-coded by agent
   - Newest first

2. **Task History** (right)
   - Completed tasks
   - Grouped by agent
   - Timestamp for each

Both auto-update every 5 seconds.

---

## 💾 Memory View

Shows business context:
- Properties being serviced
- Client information
- Important notes and decisions
- Memory files from agent conversations

---

## ⚙️ Settings View

### Notifications
**Sound Notifications Toggle:**
- **ON** (cyan/purple glow): Plays sound when agent status changes
- **OFF** (gray): Silent mode

Toggle by clicking the switch.

### System Info
Shows:
- Poll interval (5 seconds)
- Active agent count
- Total events loaded
- Last refresh timestamp

---

## 🔧 Sidebar Controls

### Desktop (>1024px width)
- **Collapse button:** Floating button to the right of sidebar
  - Click to collapse sidebar to just icons
  - Click again to expand back to full width
  - Arrow rotates to indicate direction

### Tablet (768px - 1024px)
- Sidebar auto-collapses to icon-only (60px width)
- Shows just emoji icons
- Full labels hidden to save space

### Mobile (<768px)
- **Hamburger menu:** Top-left corner (☰)
  - Click to slide sidebar in from left
  - Click overlay (dark background) to close
  - Automatically closes when you select a view

---

## 🎨 Visual Features

### Glassmorphism
The entire interface uses a frosted glass effect:
- Semi-transparent panels
- Blur backgrounds
- Subtle white borders
- Depth through layering

### Glow Effects
- **Active agents:** Neon glow matching agent color
- **Sidebar active item:** Cyan/purple gradient glow
- **Status indicators:** Pulsing when active
- **Buttons on hover:** Subtle scale + glow

### Animations
- **Page transitions:** Smooth fade-in when switching views
- **Sidebar items:** Slide in from left (staggered)
- **Agent status:** Pulse animation on active agents
- **Background:** Floating particles (cyan/purple dots)
- **Hover effects:** Scale up slightly (5-10%)

---

## 🔴 Live Indicator

**Bottom-right of status bar:**
- Green pulsing dot + "LIVE" text
- Confirms dashboard is actively polling APIs
- Updates every 5 seconds

If it stops pulsing, refresh the page.

---

## 📱 Responsive Breakpoints

| Screen Size | Behavior |
|-------------|----------|
| **Mobile** (<768px) | Hamburger menu, slide-out sidebar, stacked content |
| **Tablet** (768-1024px) | Icon-only sidebar, 2-column layouts become 1-column |
| **Desktop** (>1024px) | Full sidebar, multi-column layouts, all features visible |

---

## 🎨 Color Meanings

### Agent Colors
- **Jarvis:** Green (#63D866) - Main coordinator
- **CodeBot:** Blue (#3A7BC8) - Developer agent
- **ReviewBot:** Gold (#B49A60) - Code reviewer
- **BizBot:** Light Green (#9AED9C) - Business ops

### UI Accents
- **Cyan (#00D9FF):** Primary actions, active states
- **Purple (#A855F7):** Secondary accents, gradients
- **Amber:** Idle/warning states
- **Gray:** Offline/inactive states

---

## 🔊 Sound Notifications

When enabled (Settings → Sound Notifications):
- Plays a subtle beep when any agent status changes
- **Active → Idle:** Beep
- **Idle → Active:** Beep
- **Any status change:** Beep

**Tip:** Turn off during busy work to avoid distractions!

---

## ⚡ Keyboard Tips

While no keyboard shortcuts are built in yet, you can:
- **Tab** through navigation items
- **Enter** to activate focused item
- **Esc** to close modals (agent details)

---

## 🐛 Troubleshooting

### Sidebar won't open (mobile)
- Refresh the page
- Check browser console for errors

### Agent data not loading
- Check if backend APIs are running
- Look for error messages in browser console
- Verify API endpoints: `/api/agents`, `/api/activity`, `/api/snapshot`

### Animations stuttering
- Close other browser tabs
- Check CPU usage
- Try disabling particle background (future feature)

### Glassmorphism not showing
- Make sure browser supports backdrop-filter
- Try Chrome/Safari (better support than Firefox)

---

## 💡 Pro Tips

1. **Favorite view:** Set your default in code (`currentView` initial state)
2. **Full-screen:** Press F11 for immersive office view
3. **Monitor on second display:** Drag window to second monitor for constant monitoring
4. **Auto-refresh:** Data updates every 5s, no manual refresh needed
5. **Agent tooltips:** Hover over desks to see what agents are working on

---

## 🎯 Common Workflows

### Check Agent Status Quickly
1. Open dashboard (Office view is default)
2. Glance at desk glows:
   - Glowing = Active
   - Empty = Idle
   - Faded = Offline

### Review Recent Activity
1. Click **📝 Activity** in sidebar
2. Scan left column (Activity Feed) for latest messages
3. Check right column (Task History) for completed work

### Monitor Business Metrics
1. Click **📊 Analytics** in sidebar
2. Check top bar for lead/property counts
3. Review charts for workload distribution

### Enable Notifications
1. Click **⚙️ Settings** in sidebar
2. Toggle **Sound Notifications** ON (glows cyan/purple)
3. Test by watching for agent status changes

---

## 📞 Need Help?

- **Documentation:** See `REDESIGN_SUMMARY.md` and `CODE_SHOWCASE.md`
- **Issues:** Check browser console (F12)
- **Updates:** Pull latest from repo and run `npm install`

---

**Enjoy your modern Mission Control dashboard! 🚀**
