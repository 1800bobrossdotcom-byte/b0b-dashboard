# Molt/Clawd/Bankr Integration Analysis

**Date**: 2026-01-29  
**Source**: https://github.com/BankrBot/moltbot-skills  

---

## Quick Answer: Does Our Trading Bot Use Bankr/Molt/Clawd?

### ✅ YES - Using Bankr API
Our `live-trader.js` **already integrates with Bankr API** for trade execution:
- Uses `@bankr/sdk` for natural language trading
- Pays $0.10 USDC per request via x402 protocol
- Submits prompts like "Buy $10 of PEPE on Base"
- Bankr returns transaction data, we sign with our wallet

### ✅ YES - Using Clawd (Local Implementation)
Our `brain.js` has **custom Clawd integration** for reasoning:
- Direct Anthropic API calls (Claude claude-sonnet-4-20250514)
- Used for pattern analysis and decision guidance
- Not the Moltbot/Clawdbot ecosystem version

### ❌ NOT YET - Moltbot/Moltbot Skills
We're **not using Moltbot** or its skill system yet.

---

## What is Moltbot?

**Moltbot** (formerly Clawdbot) is an AI agent framework that can:
- Install "skills" from providers like Bankr
- Execute natural language commands
- Run automation scripts

### Key Difference From Our Implementation
| Feature | Our Bot | Moltbot |
|---------|---------|---------|
| AI Model | Custom Clawd (Claude API direct) | Built-in AI agent |
| Bankr Integration | Direct API calls | Via installed skill |
| Polymarket | Custom CLOB implementation | Via Bankr skill |
| Configuration | Environment variables | ~/.clawdbot/skills/bankr/config.json |
| Automation | Custom live-trader.js logic | Moltbot scheduled commands |

---

## Bankr Skill Capabilities (Reference)

From `moltbot-skills/bankr/SKILL.md`:

### Trading Operations
- **Token Swaps**: "Buy $50 of ETH on Base"
- **Cross-Chain**: "Bridge 100 USDC from Polygon to Base"
- **Limit Orders**: Execute at target prices
- **Stop Loss**: Automatic sell protection
- **DCA**: Dollar-cost averaging strategies
- **TWAP**: Time-weighted average pricing

### Polymarket (We Should Use This!)
```bash
scripts/bankr.sh "What are the odds Trump wins?"
scripts/bankr.sh "Bet $10 on Yes for [market]"
scripts/bankr.sh "Show my Polymarket positions"
```

### Leverage Trading
- Long/short positions (up to 50x crypto, 100x forex)
- Via Avantis on Base

### Token Deployment
- Deploy ERC20 via Clanker
- Rate limits: 1/day standard, 10/day Bankr Club

### Arbitrary Transactions
- Submit raw EVM transactions with calldata
- Custom contract calls

---

## What We Should Learn/Adopt

### 1. Use Bankr for Polymarket (Instead of Custom CLOB)
Our custom Polymarket implementation is complex. Bankr can do it with:
```javascript
await bankr.executeTrade('Bet $10 on Yes for "Will ETH hit 5000 by March?"');
```

### 2. Leverage Trading
Bankr supports Avantis leverage:
```javascript
await bankr.executeTrade('Open 5x long on ETH with $100');
```

### 3. DCA Automation
Bankr handles DCA natively:
```javascript
await bankr.executeTrade('DCA $100 into ETH weekly');
```

### 4. Natural Language Everything
Instead of building custom integrations, just ask Bankr:
- Portfolio: "Show my complete portfolio"
- Research: "Do technical analysis on ETH"
- Transfer: "Send 0.1 ETH to vitalik.eth"

---

## Current Integration Status

### live-trader.js
```javascript
// Already using Bankr SDK
const client = await getBankrSdkClient();
const result = await client.promptAndWait({
  prompt: 'Buy $10 of PEPE on Base',
  walletAddress: this.walletAddress,
});
```

### brain.js (Clawd Reasoning)
```javascript
// Custom Claude integration for reasoning
class Clawd {
  async reason(prompt, context = {}) {
    // Calls Anthropic API directly
    const response = await this.callAnthropic(systemPrompt, prompt);
    return response;
  }
}
```

---

## Recommendations

### Short Term
1. **Keep current Bankr integration** - It works well for trading
2. **Use Bankr for Polymarket** - Simpler than custom CLOB
3. **Add DCA/automation via Bankr** - Native support

### Medium Term
1. **Consider Moltbot adoption** - Would give us skill ecosystem
2. **Unify Clawd implementations** - Use Moltbot's Clawd or keep custom

### Long Term
1. **Publish our own skills** - Contribute to moltbot-skills repo
2. **Build D0T skill** - Vision/trading as Moltbot skill

---

## API Reference

### Bankr Agent API
- Endpoint: `https://api.bankr.bot`
- Auth: x402 payment ($0.10 USDC) or API key (Bankr Club)
- Key format: `bk_[A-Z0-9]{32}`

### Supported Chains
| Chain | Native | Best For |
|-------|--------|----------|
| Base | ETH | Memecoins, general trading |
| Polygon | MATIC | Gaming, NFTs, Polymarket |
| Ethereum | ETH | Blue chips |
| Solana | SOL | High-speed trading |
| Unichain | ETH | Newer L2 |

---

---

# ClawdBody - 24/7 Autonomous Agent Platform

**Source**: https://github.com/Prakshal-Jain/ClawdBody  
**Live**: https://clawdbody.com/

## What is ClawdBody?

ClawdBody is a **1-click deployment platform** that runs ClawdBot 24/7 on cloud VMs.
Unlike Moltbot (skill-based), ClawdBody provides:

- 🚀 **Cloud VM** - Runs on Orgo/AWS/E2B, always online
- 📧 **Gmail Integration** - Send/reply emails automatically
- 📅 **Calendar** - Create/manage events
- 🖥️ **Web Terminal** - Real-time interaction
- 🤖 **Telegram Bot** - Mobile control
- 💾 **Persistent Memory** - Remembers across sessions
- 🌐 **Browser Automation** - Can interact with web apps

## Best Use Cases for B0B

### 1. **24/7 Trading Monitor** (HIGH VALUE)
ClawdBody VM runs continuously - perfect for:
- Monitoring market conditions while we sleep
- Executing time-sensitive trades
- Watching Polymarket odds shifts

### 2. **Email Alerts & Briefings** (MEDIUM VALUE)
Send automated emails for:
- Daily portfolio summaries
- Trade execution confirmations
- Risk alerts (stop loss triggered)

### 3. **Calendar Trading Windows** (MEDIUM VALUE)
Schedule trading based on:
- Market open/close times
- News event calendars
- DCA execution schedules

### 4. **Browser Automation** (HIGH VALUE)
Actions our API-only bot can't do:
- Claim airdrops requiring browser signatures
- Interact with dApps without APIs
- Screenshot market dashboards

### 5. **Telegram Mobile Control** (NICE TO HAVE)
Control B0B from phone:
- Check positions
- Emergency pause
- Manual trade commands

---

# Team Discussion: Best Integration Path

## Option A: Full ClawdBody Deployment
Deploy B0B brain on ClawdBody VM for 24/7 operation.

**Pros:**
- Always online, no local machine needed
- Gmail/Calendar/Telegram built-in
- Browser automation for non-API tasks

**Cons:**
- Migration effort
- VM costs (Orgo/AWS)
- Less control than local

## Option B: Hybrid - ClawdBody as Companion
Keep B0B local, use ClawdBody for supplementary tasks:
- Email alerts
- Browser automation
- Backup monitoring

**Pros:**
- Low risk, additive
- Keep existing setup
- Test before full migration

**Cons:**
- Two systems to maintain
- Communication complexity

## Option C: Extract Patterns Only
Don't deploy ClawdBody, just learn from it:
- Gmail integration code
- Calendar scheduling
- Persistent memory patterns

**Pros:**
- No new infrastructure
- Cherry-pick best ideas
- Full control

**Cons:**
- More dev work
- Miss browser automation benefit

---

# Actionable Updates

## IMMEDIATE (Do Now)

### 1. Simplify Polymarket via Bankr
**File**: `brain/live-trader.js`
```javascript
// BEFORE: Complex CLOB implementation (500+ lines)
// AFTER: Single Bankr call
async function executePolymarketTrade(market, position, amount) {
  const prompt = `Bet $${amount} on ${position} for "${market}"`;
  return await bankr.executeTrade(prompt);
}
```

### 2. Add DCA Support via Bankr
**File**: `brain/live-trader.js`
```javascript
async function setupDCA(token, amount, frequency) {
  const prompt = `DCA $${amount} into ${token} ${frequency}`;
  return await bankr.executeTrade(prompt);
}
```

### 3. Leverage Trading Option
**File**: `brain/live-trader.js`
```javascript
async function openLeveragePosition(token, multiplier, amount, direction) {
  const prompt = `Open ${multiplier}x ${direction} on ${token} with $${amount}`;
  return await bankr.executeTrade(prompt);
}
```

## SHORT TERM (This Week)

### 4. Try ClawdBody for Email Alerts
- Fork https://github.com/Prakshal-Jain/ClawdBody
- Deploy to Orgo/Vercel
- Configure Gmail integration
- Test sending trade alerts

### 5. Add Telegram Bot to B0B
Extract from ClawdBody or build simple:
- `/status` - Portfolio value
- `/pause` - Stop trading
- `/resume` - Resume trading
- `/positions` - Current holdings

## MEDIUM TERM (This Month)

### 6. Evaluate Full ClawdBody Migration
If email alerts work well:
- Test running brain.js on ClawdBody VM
- Compare reliability vs local
- Decision on full migration

### 7. Browser Automation Tasks
Use ClawdBody for:
- Airdrop claims
- dApp interactions
- Market screenshots

---

## Files Modified/Created

### New Files
- `brain/notifications.js` - Telegram/Webhook/Email notification system
- `brain/clawdbody/` - ClawdBody cloned (for reference patterns)
- `brain/data/discussions/2026-01-29-clawdbody-evaluation.md` - Team evaluation doc

### Modified Files
- `brain/live-trader.js`:
  - Added notification system import
  - Added trade execution notifications
  - Added stop loss notifications
  - Added Bankr-powered simplified trading functions
  
- `brain/brain-server.js`:
  - Added `/notify` endpoint (send notifications)
  - Added `/notify/telegram` endpoint (direct Telegram)
  - Added `/notify/status` endpoint (check config)
  - Added `/telegram/webhook` endpoint (receive commands)
  - Added Bankr-powered trading API endpoints

---

*Last updated: 2026-01-29*
