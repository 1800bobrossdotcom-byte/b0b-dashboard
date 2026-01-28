# Clawdbot/Moltbot: AI Trading Assistant for Polymarket

**Source:** https://x.com/0xMovez/status/2016285520825835834
**Author:** @0xMovez (Movez)
**Date:** January 27, 2026
**Saved:** January 28, 2026

---

## 1. What is Clawdbot?

Clawdbot (now rebranded as **Moltbot**) is a self-hosted AI assistant framework that operates on your hardware - whether that's your Mac, Linux machine, or a small VPS costing as little as $5/month.

Unlike cloud-based chatbots, Clawdbot runs locally on your infrastructure, giving you **full control over security, data, and computational resources**.

### Core Value for Traders

Clawdbot bridges AI capabilities with the tools you already use. It connects to:
- Telegram
- Discord  
- WhatsApp
- X (Twitter)

**Simultaneously.** For Polymarket traders, this means your AI agent can monitor prices, execute trades, analyze social sentiment, and alert you - all through familiar messaging interfaces.

---

## 2. How Clawdbot Connects to Trading Infrastructure

Clawbot functions as a **central nervous system** for your trading operation:

### 1. X Integration
Monitor real-time tweets about your trading markets, track sentiment shifts, and identify breaking news before prices adjust. Clawdbot can pull X data through its web browsing capabilities and analyze it for trading signals.

### 2. Polymarket Account Link
Through Polymarket's **CLOB (Central Limit Order Book) API**, Clawdbot connects directly to your trading account, enabling:
- Order placement
- Portfolio monitoring
- Real-time price tracking

### 3. Telegram Integration
Receive notifications and send commands to Clawdbot via Telegram DMs or group chats. This is your mobile command center.

### 4. Discord Integration
Set up a dedicated Discord server where Clawdbot channels important alerts, trade executions, and performance data.

### 5. Persistent Memory System
Unlike standard chatbots, Clawbot maintains **continuous memory** across sessions, remembering your:
- Trading history
- Positions
- Risk parameters
- Past decisions

---

## 3. Real Use Cases for Polymarket Trading

### 1) Real-Time Market Research

Clawbot becomes your personal quant research department, running 24 strategies simultaneously across all active markets.

**Multi-Market Arbitrage Scanner:**
```
Scans 10+ correlated markets every 15 seconds:

• "Trump wins election" → "Harris wins election"
• "BTC >$100K Dec" → "ETH >$5K Dec" 
• "Fed cuts rates" → "S&P500 monthly gain"
```

**Opportunity Detection:**
When combined YES/NO < $1.00 → Instant arb

Example: 
- Market A YES @ 0.48 + Market B NO @ 0.49 
- = Guaranteed $1.00 payout for $0.97 cost

### 2) Social Sentiment Divergence

Every 60 seconds per market:
```
1. Scrapes 100 latest X tweets by keywords
2. Claude NLP → Bullish/Neutral/Bearish scores
3. Compares vs current odds
4. Alerts when divergence >20%
```

**Example Signal:**
> "Tesla robotaxi event" market: 62¢ YES
> X sentiment: 82% bullish (vs 62% implied)
> BUY signal @ +20% edge

### 3) Liquidity Momentum Tracker

Monitors bid/ask spreads + order book depth:
```
• Thin liquidity + breaking news = volatility trap
• Deep liquidity + whale orders = trend continuation
• Fakeouts detected by rapid spread widening
```

**Setup:** Poll Polymarket CLOB API every 5 seconds → flag liquidity shifts >30%

### 4) Trade Analysis & Mistake Tracking

Automatic post-mortem logging:
```
Every trade records:
• Entry thesis + probability estimate
• Market conditions at entry  
• Position size vs Kelly optimal
• Outcome vs expected value
```

**Monthly mistake report identifies:**
- Calibration errors (over/under confident)
- Process breaks (deviated from rules)
- Information gaps (missed key data)
- Execution failures (bad timing)

### 5) Polymarket Insider Analyzer

Tracks "smart money" wallets via analytics APIs (Polymarket Analytics, Polysights).

**Identifies insiders by:**
- New wallets → massive single-market bets
- Perfect timing on rare events
- High hit rates on low-odds outcomes

**Real-time signals:**
```
"Wallet 0xABC just bought $250K YES @ 0.12
Market now 0.28 (+133%)
Follow or fade?"
```

### 6) Performance Metrics Dashboard

Clawdbot builds your personal trading dashboard tracking all key metrics.

---

## Key Takeaways for B0B

1. **Self-hosted = Control** - Run on $5/mo VPS, own your data
2. **Multi-channel alerts** - Telegram + Discord + X monitoring
3. **Persistent memory** - Remembers trading history across sessions
4. **Arbitrage scanning** - Automated multi-market correlation checks
5. **Sentiment divergence** - NLP on tweets vs current odds = edge detection
6. **Liquidity tracking** - Order book depth monitoring for entry timing
7. **Mistake logging** - Automated post-mortem for continuous improvement
8. **Whale tracking** - Follow smart money wallet movements

---

## Related Resources

- Setup guide: @damianplayer's 30-minute Clawdbot setup
- Polymarket CLOB API documentation
- Polysights / Polymarket Analytics for whale tracking

---

## Implementation Notes for Live Trader

These patterns can be integrated into `brain/live-trader.js`:

1. **Sentiment divergence** → Add X/Twitter scraping as signal source
2. **Liquidity tracking** → Already have DexScreener, add depth monitoring
3. **Whale tracking** → Monitor large wallet movements on BASE
4. **Multi-market arb** → Cross-reference correlated tokens
5. **Mistake logging** → Already logging trades, add post-mortem analysis

---

## 🔥 CRITICAL CONFIG TIP: Memory Superpowers

**Source:** Community tip (January 28, 2026)

By default, the 2 best Clawd memory features are turned OFF. Run this prompt to enable them:

```
Enable memory flush before compaction and session memory search in my Clawdbot config. 
Set `compaction.memoryFlush.enabled` to true and set `memorySearch.experimental.sessionMemory` 
to true with sources including both memory and sessions. Apply the config changes.
```

### What This Enables:

**1. Memory Flush Before Compaction**
- Config: `compaction.memoryFlush.enabled: true`
- Your AI automatically saves everything important to a file **right before its context gets wiped**
- Nothing slips through the cracks between compactions/sessions

**2. Session Memory Search**
- Config: `memorySearch.experimental.sessionMemory: true`
- Sources: `memory` + `sessions`
- Your AI can search through **every conversation it's ever had** with you
- Even ones it no longer "remembers" in active context

### Result: 10000x better memory

This stops your AI from getting confused between compactions/sessions. Essential for long-running trading operations where context continuity is critical.
