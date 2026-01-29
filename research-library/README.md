# 📚 B0B Research Library

> Curated collection of trading frameworks, AI agents, security research, and financial tools.

## Quick Clone All

```bash
cd research-library
./clone-all.sh
```

---

## 🔒 Security Research (NEW!)

> **Goal:** "lets become the best bug bounty hunters internationally"

| Resource | Location | Purpose |
|----------|----------|---------|
| **Security Index** | [security-guides/SECURITY-RESEARCH-INDEX.md](security-guides/SECURITY-RESEARCH-INDEX.md) | Full research library |
| **Whitehat Guide** | [security-guides/whitehat-pentesters-guide.pdf](security-guides/whitehat-pentesters-guide.pdf) | Pentesting methodology |
| **NSA Network Guide** | [security-guides/NSA-home-network-security.pdf](security-guides/NSA-home-network-security.pdf) | Network hardening |

### Key External Resources
- **NSA Cyber GitHub:** github.com/nsacyber (38 repos)
- **HackDB:** hackdb.com (team has login)
- **GHDB:** exploit-db.com/google-hacking-database
- **The Hacker News:** Daily CVE tracking

---

## 🏆 Priority Repos (Proven Patterns)

### Trading & Markets

| Repo | Stars | Why We Need It |
|------|-------|----------------|
| [Polymarket/agents](https://github.com/Polymarket/agents) | 1,895⭐ | Official SDK, RAG research, py-clob-client |
| [polymarket-mcp-server](https://github.com/berlinbra/polymarket-mcp-server) | 149⭐ | 45 trading tools, enterprise safety |
| [AutoHedge](https://github.com/The-Swarm-Corporation/AutoHedge) | 1,005⭐ | Multi-agent swarm architecture |
| [maverick-mcp](https://github.com/kenzic/maverick-mcp) | 326⭐ | VectorBT backtesting, TA indicators |
| [hummingbot](https://github.com/hummingbot/hummingbot) | 7,500⭐ | Market making, arbitrage strategies |
| [freqtrade](https://github.com/freqtrade/freqtrade) | 26,000⭐ | Battle-tested trading patterns |

### AI Agents & Frameworks

| Repo | Stars | Why We Need It |
|------|-------|----------------|
| [Claude-Computer-Use](https://github.com/anthropics/anthropic-quickstarts) | - | Computer control patterns |
| [LLM-TradeBot](https://github.com/traders-lab/LLM-TradeBot) | - | 17-agent collaborative framework |
| [kalshi-ai-trading-bot](https://github.com/) | - | Multi-agent decision engine |

### Crypto/DeFi

| Repo | Stars | Why We Need It |
|------|-------|----------------|
| [uniswap-v3-core](https://github.com/Uniswap/v3-core) | 4,200⭐ | DEX mechanics, liquidity math |
| [flashbots/mev-boost](https://github.com/flashbots/mev-boost) | 1,000⭐ | MEV protection patterns |

---

## 📖 Learnings (Saved Articles)

| File | Source | Topic |
|------|--------|-------|
| [clawdbot-polymarket-guide.md](../learnings/clawdbot-polymarket-guide.md) | @0xMovez | Clawdbot/Moltbot for Polymarket trading |

---

## 🔧 Integration Status

| Source | Integrated Into | Status |
|--------|-----------------|--------|
| polymarket-mcp-server | brain/live-trader.js | ✅ Patterns used |
| Polymarket/agents | b0b-finance/trading-d0t.js | ✅ SDK patterns |
| AutoHedge | b0b-finance/nash-swarm.js | ✅ Swarm architecture |
| maverick-mcp | - | ⏳ Pending |
| Clawdbot patterns | - | ⏳ To implement |

---

## 📥 How to Add New Resources

1. **Articles/Threads:** Save to `brain/learnings/` as markdown
2. **Repos:** Add to this README + clone to `research-library/repos/`
3. **APIs:** Document in `brain/config/apis.json`

---

## 🎯 Next to Clone

Priority order for tonight:
1. `Polymarket/agents` - Official patterns
2. `AutoHedge` - Swarm trading
3. `freqtrade` - Backtesting framework
4. `hummingbot` - Market making

---

*Last updated: January 28, 2026*
