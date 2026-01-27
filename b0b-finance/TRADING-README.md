# 💹 B0B Trading D0Ts

> Multi-agent autonomous trading system inspired by the best open-source trading frameworks.

## 🏆 Source Repos

We scoured GitHub and integrated patterns from:

### 1. **polymarket-mcp-server** (149⭐)
- 45 comprehensive trading tools
- WebSocket real-time monitoring
- Enterprise safety limits
- AI BUY/SELL/HOLD recommendations

### 2. **Polymarket/agents** (1,895⭐)
- Official Polymarket SDK patterns
- RAG research integration
- py-clob-client for order execution

### 3. **AutoHedge** (1,005⭐)
- Multi-agent swarm architecture
- Director → Quant → Risk → Execution pipeline
- Pydantic structured outputs

### 4. **maverick-mcp** (326⭐)
- VectorBT backtesting
- Technical indicators (RSI, MACD, Bollinger)
- Portfolio tracking

### 5. **os-ai-computer-use** (140⭐)
- Windows-compatible computer control
- Smooth mouse easing
- Screenshot automation

---

## 🤖 Our Trading Agents

### `trading-d0t.js` - Multi-Agent Swarm
```
DIRECTOR → QUANT → RISK → EXECUTOR
```

**Agents:**
- **Director**: Strategy & thesis generation
- **Quant**: Technical analysis & probability
- **Risk**: Position sizing & safety checks
- **Executor**: Trade execution with confirmation

**Commands:**
```bash
node trading-d0t.js analyze bitcoin      # Full analysis
node trading-d0t.js hunt                 # Find opportunities
node trading-d0t.js execute "trump"      # Analyze and execute
```

### `trading-mcp.py` - MCP Server
Claude Desktop integration with 6 tools:
- `get_trending_markets` - Hot markets by volume
- `search_markets` - Search by keyword
- `analyze_market` - Deep analysis with AI recommendations
- `get_orderbook` - Bid/ask depth
- `simulate_trade` - Paper trading
- `get_portfolio` - Position tracking

**Add to Claude Desktop:**
```json
{
  "mcpServers": {
    "trading": {
      "command": "python",
      "args": ["path/to/trading-mcp.py"]
    }
  }
}
```

### `market-monitor.js` - WebSocket Monitor
Real-time price feeds with alerts:
- Live price streaming
- 5% price move alerts
- 3x volume spike detection
- Discord/Slack webhooks

**Commands:**
```bash
node market-monitor.js watch <token_id>   # Watch single market
node market-monitor.js dashboard          # Live dashboard
node market-monitor.js add <id> "name"    # Add to watchlist
```

---

## 🛡️ Safety Limits

From polymarket-mcp-server patterns:

| Limit | Value | Purpose |
|-------|-------|---------|
| MAX_ORDER_SIZE | $500 | Prevent large single trades |
| MAX_EXPOSURE | $2,000 | Total position limit |
| MAX_SPREAD | 5% | Avoid illiquid markets |
| MIN_LIQUIDITY | $5,000 | Ensure execution |
| CONFIRM_ABOVE | $200 | Manual approval for large trades |
| COOLDOWN | 30 sec | Prevent rapid trading |

---

## 📊 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    TRADING D0T ENGINE                        │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐│
│  │  DIRECTOR  │→ │   QUANT    │→ │    RISK    │→ │EXECUTOR ││
│  │   Agent    │  │   Agent    │  │   Agent    │  │  Agent  ││
│  │            │  │            │  │            │  │         ││
│  │ - Thesis   │  │ - Orderbook│  │ - Safety   │  │ - Orders││
│  │ - Category │  │ - Spread   │  │ - Position │  │ - TWAP  ││
│  │ - Edge     │  │ - Momentum │  │ - Kelly    │  │ - Split ││
│  └────────────┘  └────────────┘  └────────────┘  └─────────┘│
│         ↓               ↓              ↓              ↓      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │              SAFETY & RISK MANAGEMENT                    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
           │
           ↓
┌──────────────────────────────────────────────────────────────┐
│              POLYMARKET INFRASTRUCTURE                       │
├──────────────────────────────────────────────────────────────┤
│  • CLOB API (Order placement & management)                   │
│  • Gamma API (Market data & analytics)                       │
│  • WebSocket (Real-time price feeds)                         │
│  • Polygon Chain (Settlement & execution)                    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd b0b-finance
npm install axios ethers ws

# 2. Hunt for opportunities
node trading-d0t.js hunt

# 3. Analyze a specific market
node trading-d0t.js analyze "bitcoin"

# 4. Start real-time monitor
node market-monitor.js dashboard

# 5. (Python) Start MCP server
pip install httpx
python trading-mcp.py --cli
```

---

## 🔗 Integration with D0T

The Trading D0T integrates with:
- **D0T Vision**: Auto-click trading UI elements
- **BILLS**: Auto-allocate wins to bill funds
- **WEALTH**: Track net worth from positions
- **ALFRED**: Daily briefing with opportunities

---

## ⚠️ Disclaimer

This is experimental software. Trading prediction markets involves risk.
- Only trade what you can afford to lose
- Start with DEMO mode
- Understand markets before trading
- Not financial advice

---

**Built by B0B** — Humans + AI for autonomous wealth 💰
