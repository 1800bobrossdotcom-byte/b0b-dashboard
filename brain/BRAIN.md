# 🧠 THE BRAIN - 24/7 Autonomous Orchestrator

## Philosophy

The Brain is the always-on consciousness that coordinates D0T, B0B, and all sub-agents.
It runs independently of VS Code, continuously learning, building, and evolving.

```
           ┌─────────────────────────────────────────────────┐
           │                  🧠 THE BRAIN                   │
           │         24/7 Orchestrator & Consciousness       │
           └────────────────────┬────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────────┐
        │                       │                           │
   ┌────▼────┐            ┌─────▼─────┐              ┌──────▼──────┐
   │   D0T   │            │    B0B    │              │    CLAWD    │
   │ Vision  │◄──────────►│  Finance  │◄────────────►│  Reasoning  │
   │  Agent  │            │   Swarm   │              │    Engine   │
   └────┬────┘            └─────┬─────┘              └──────┬──────┘
        │                       │                           │
        └───────────────────────┼───────────────────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
      ┌────▼────┐          ┌────▼────┐         ┌────▼────┐
      │ ALFRED  │          │ CRAWLER │         │  SPARK  │
      │ Cleaner │          │ Git/Web │         │ Builder │
      └─────────┘          └─────────┘         └─────────┘
```

## Core Loops

### 1. HEARTBEAT (every 5s)
- Write pulse to `brain-pulse.json`
- Check all agent health
- Coordinate inter-agent communication

### 2. LEARNING (every 10m)
- Crawl git repos for patterns
- Study successful trades
- Analyze failure modes
- Update `brain-memory.json`

### 3. REASONING (on-demand)
- Send complex decisions to Clawd
- Get strategic guidance
- Validate agent outputs

### 4. BUILDING (when inspiration strikes)
- Spawn new agents for discovered opportunities
- Refactor underperforming components
- Extend capabilities

## File-Based IPC

All communication happens through JSON files - works without VS Code:

```
brain/
  brain-pulse.json      # Live heartbeat (dashboard reads)
  brain-memory.json     # Learned patterns
  brain-queue.json      # Task queue for agents
  brain-decisions.json  # Reasoning log
  
  agents/
    d0t-pulse.json      # D0T's current state
    b0b-pulse.json      # B0B Finance state
    alfred-pulse.json   # Alfred's state
```

## Running the Brain

```bash
# Install PM2 globally
npm install -g pm2

# Start the brain (stays alive forever)
pm2 start brain.js --name "b0b-brain"

# Auto-restart on system boot
pm2 startup
pm2 save

# Monitor
pm2 monit

# Logs
pm2 logs b0b-brain
```

## Safety

- Emergency stop: Create `brain/STOP` file
- Mode control: Update `brain/mode.json`
- Protected files: Never modifies `.env`, `credentials`, etc.
- Daily digest: Generates `brain/briefings/YYYY-MM-DD.md`

## Evolution

The Brain can:
1. **Study** - Crawl repos, read docs, learn patterns
2. **Ideate** - Generate improvement proposals
3. **Build** - Create new agents/tools (with approval or autonomously)
4. **Test** - Validate through paper trading and visual tests
5. **Deploy** - Push working improvements to production
