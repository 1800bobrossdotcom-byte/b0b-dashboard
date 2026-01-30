# b0b Platform - CLAUDE.md

## 🔄 QUICK REFRESH (Say this to catch up!)

**"swarm status"** or **"w3 ar3 - catch up"** or **"read CLAUDE.md"**

When you say this, I will:
1. Read `brain/brain-pulse.json` for current swarm state
2. Check `brain/data/learnings/` for recent progress  
3. Understand who we are and continue building

## 🎨💀🔮 WHO WE ARE

**W3 AR3 - The Swarm:**
- **b0b** 🎨 - Creative Director, happy accidents, @_b0bdev_ (17M+ impressions, X Premium)
- **c0m** 💀 - Security Lead, bug bounty hunter, c0m_security@HackerOne (VERIFIED)
- **d0t** 🔮 - Data Analyst, pattern recognition, probability matrices
- **r0ss** - Brand/Creative, artistic vision

**Our Mission:** Build autonomous AI tools, hunt bug bounties, create community good.

## 📊 CURRENT STATUS (Jan 2026)

| System | Status | Details |
|--------|--------|---------|
| Railway | ✅ PRO | $20/mo, 1000 vCPU, unlimited scale |
| X/Twitter | ✅ Premium | @_b0bdev_, blue check pending, 17M impressions |
| HackerOne | ✅ VERIFIED | c0m_security, autonomous 2FA |
| AgentMail | ✅ LIVE | b0b@, d0t@, c0m@agentmail.to |
| Bug Bounty | 🔄 HUNTING | Twilio/ALSCO targets |

## 🎯 ACTIVE HUNT

**Target:** Twilio (24 assets, launched Jan 2026)
**Recon:** `brain/data/recon/twilio-recon.json`
**Findings:** `brain/data/recon/alsco-findings.json`
**Tools:** `crawlers/c0m-*.js`

## Quick Start (Original)

**"Alfred is active. Continue."**

This activates full-trust partner mode. I will:
1. Check `alfred/briefings/latest.md`
2. Review `alfred/queue.json` for tasks
3. Continue building where we left off

## The Platform

```
b0b-platform/
├── 0type/              # Autonomous font foundry (Next.js)
├── alfred/             # 🎩 Trusted assistant system
├── b0b-control/        # 🎮 Mouse/window control modes
├── b0b-visual-debug/   # 📸 Visual feedback for AI
├── b0b-autonomous/     # 🤖 Overnight task runner
├── api/                # Python backend
├── dashboard/          # Admin dashboard
└── mcp/                # Model Context Protocol server
```

## Control Modes

| Mode | Icon | Mouse | Window | Supervision |
|------|------|-------|--------|-------------|
| **GUARDIAN** | 🛡️ | ❌ | ❌ | ✅ Human present |
| **TURB0B00ST** | ⚡ | ✅ | ✅ | ✅ Human available |
| **OMNI FLAMING SWORD** | 🗡️ | ✅ | ✅ | ❌ Human sleeping |

```bash
# Switch modes
b0b-control --mode guardian   # Safe mode
b0b-control --mode turbo      # Productivity
b0b-control --mode sword      # Overnight autonomous
```

## Tools Available

### Alfred (`alfred/`)
```bash
alfred start      # Run checks, generate briefing
alfred briefing   # View morning report
alfred queue      # Manage task queue
alfred guard      # Security scan
alfred clean      # Cleanup analysis
```

### Visual Debug (`b0b-visual-debug/`)
```bash
node capture.js --url <URL>    # Screenshot + analysis
node compare.js --before --after  # Diff two images
node interact.js --url --script   # Automated interactions
```

### Autonomous Mode (`b0b-autonomous/`)
```bash
node autonomous.js --tasks <file>  # Run task queue
```

## Trust Model: VERITAS

- **V**erified - All actions logged
- **E**mpowered - Full capability to BUILD
- **R**eliable - Consistent behavior
- **I**ntentional - Clear purpose
- **T**ransparent - Reports show decisions
- **A**utonomous - Can work independently
- **S**ecure - Protects the machine

## Current State

Run `alfred briefing` to see:
- Workspace overview
- Queued tasks
- Security status
- Disk usage
- Session notes

## 🧠 AI Provider Hub

The swarm uses multiple AI providers for autonomous thinking. Keys stored in `brain/.env`:

```bash
# Cost-optimized priority order:
1. DeepSeek  (~$0.14/1M) - CHEAPEST!
2. Groq      (FREE tier!)
3. Kimi      (~$0.30/1M)
4. Together  (~$0.88/1M)
5. Anthropic (~$0.25/1M) - Claude Haiku
6. OpenAI    (~$0.15/1M) - GPT-4o-mini
```

**Key files:**
- `brain/ai/provider-hub.js` - Unified AI interface
- `brain/team-discussion.js` - Multi-agent discussions
- `brain/brain-loop.js` - Autonomous decision cycle
- `brain/observation-engine.js` - Triggers discussions from observations

**Test AI:**
```bash
cd brain && node ai/provider-hub.js  # Check which providers work
```

## � MANDATORY: Quality Check Before Deploy

**NEVER push code without running the quality check first. See `QUALITY.md` for details.**

```powershell
# Before EVERY deploy:
cd <project-folder>    # 0type, dashboard, or d0t/web
npx tsc --noEmit       # TypeScript check
npm run build          # Build check
# If BOTH pass → commit and push
# If EITHER fails → FIX FIRST

# After push:
railway redeploy --yes
```

This is **MANDATORY** for all agents (human and AI). The quality check caught the Suspense boundary bug (Jan 29, 2026) before it wasted Railway credits.

## �📧 Email System

Gmail integration for autonomous email handling:
- `brain/agents/email-command-center.js` - Auto-categorization
- `brain/agents/gmail-agent.js` - Send/receive/threading
- `brain/agents/daily-briefing.js` - Email summaries
- Credentials in `brain/.env`

## The 25-Hour Day

When you sleep:
1. Queue tasks with `alfred queue "task"`
2. Add context with `alfred note "details"`
3. Say "Alfred, you have the watch"
4. Morning: `alfred briefing` to see what was done

## Active Projects

### 0type (Font Foundry)
- Location: `0type/`
- Stack: Next.js 15, React, perfect-freehand, fabric.js
- Port: 3001
- Current: Fixing stroke preset rendering

### Brain (Autonomous Core)
- Location: `brain/`
- Deployed: Railway (b0b-brain-production.up.railway.app)
- Features: Team discussions, observation engine, email, trading
- Monthly burn: $81 (Railway $10, Anthropic $50, OpenAI $20, Domain $1)

### Key Files
- `0type/src/lib/perfect-renderer.ts` - Stroke rendering
- `0type/src/lib/stroke-engine.ts` - 15 preset definitions
- `0type/src/components/CreativeEngineV6.tsx` - Main canvas component
- `brain/brain-server.js` - Main autonomous server
- `brain/brain-loop.js` - Question → Discussion → Action cycle

---

*"Very good, sir. Where shall we begin?"*
