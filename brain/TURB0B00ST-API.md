# TURB0B00ST FINANCE API

🚀 **Live Trading Data Server** — d0t swarm | Nash equilibrium | Multi-agent consensus

## Overview

The TURB0B00ST API provides real-time access to the trading intelligence system, including:
- L0RE Intelligence classification
- d0t market signals
- Nash equilibrium state
- Multi-agent consensus voting
- Swarm wallet status

## Running

```bash
cd brain
node turb0b00st-api.js
```

Or with a custom port:
```bash
FINANCE_PORT=3003 node turb0b00st-api.js
```

## Endpoints

### Core

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/finance/treasury` | GET | Treasury & trading data |
| `/l0re/collection` | GET | L0RE art collection |
| `/trading/history` | GET | Trade history |

### Intelligence (NEW 🆕)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/l0re/intelligence` | GET | Full L0RE state classification |
| `/d0t/signals` | GET | d0t decision engine signals |
| `/d0t/intelligence` | GET | Full d0t trading analysis |
| `/d0t/swarm` | GET | d0t swarm wallet status |
| `/d0t/history` | GET | Decision history |
| `/trading/decide` | POST | Run TURB0B00ST decision engine |

## Response Examples

### GET /d0t/signals

```json
{
  "timestamp": "2026-01-31T14:13:16.216Z",
  "decision": "BUY",
  "confidence": 0.644,
  "size": 0.0205,
  "l0reCode": "n.3qlb/t.l3/e.l/f.dist",
  "nashState": "EQUILIBRIUM",
  "agents": {
    "d0t": { "state": "EQUILIBRIUM_HARVEST", "vote": "NEUTRAL" },
    "c0m": { "level": 1, "veto": false },
    "b0b": { "state": "CULTURE_BUILD", "vote": "NEUTRAL" },
    "r0ss": { "coherence": "LOW", "vote": "BULLISH" }
  },
  "reasoning": [
    "Moderate bullish signal (net: 0.220)",
    "Nash state: EQUILIBRIUM (multiplier: 1x)"
  ]
}
```

### GET /l0re/intelligence

```json
{
  "l0reCode": "n.3qlb/t.l3/e.l/f.dist",
  "nash": {
    "state": "EQUILIBRIUM",
    "description": "Stable state, efficient pricing, range-bound",
    "action": "accumulate"
  },
  "entropy": {
    "value": 0,
    "classification": "LOW",
    "market_meaning": "Strong trend, high conviction, follow momentum"
  },
  "fractal": {
    "pattern": "DISTRIBUTION",
    "description": "Wyckoff distribution, smart money exiting"
  },
  "tegmark": {
    "L1": { "level": "MATHEMATICAL", "volatility": 0 },
    "L2": { "level": "EMERGENT", "trend": "sideways" },
    "L3": { "level": "NARRATIVE", "sentiment": 0.5 },
    "L4": { "level": "META", "reflexivity": 0 }
  }
}
```

### POST /trading/decide

Request body can include additional context:
```json
{
  "sentiment": 45,
  "volumeChange": 15,
  "narrativeStrength": 0.7
}
```

Response:
```json
{
  "decision": "BUY",
  "confidence": 0.644,
  "size": 0.0205,
  "l0re": {
    "code": "n.3qlb/t.l3/e.l/f.dist",
    "nash": "EQUILIBRIUM",
    "nashAction": "accumulate"
  },
  "risk": {
    "stopLoss": 0.05,
    "takeProfit": 0.15,
    "maxSize": 0.1
  },
  "reasoning": ["..."]
}
```

## L0RE Code Format

L0RE codes encode multi-dimensional market state:

```
n.3qlb / t.l3 / e.l / f.dist
  │       │     │     └── Fractal: DISTRIBUTION
  │       │     └── Entropy: LOW
  │       └── Tegmark dominant: L3 (Narrative)
  └── Nash: EQUILIBRIUM
```

### Nash States
- `n.c00p` - COOPERATIVE (positive-sum)
- `n.c0mp` - COMPETITIVE (zero-sum)
- `n.d3f3` - DEFECTION (trust breakdown)
- `n.3qlb` - EQUILIBRIUM (stable)
- `n.schl` - SCHELLING (coordination)

### d0t Market States
- `d.t4cc` - TURB0_ACCUMULATION
- `d.d1hd` - DIAMOND_HANDS
- `d.3scv` - ESCAPE_VELOCITY
- `d.d5tr` - DISTRIBUTION_ALERT
- `d.c4pt` - CAPITULATION_ZONE
- `d.schl` - SCHELLING_CONVERGENCE
- `d.3qhr` - EQUILIBRIUM_HARVEST
- `d.3nch` - ENTROPY_CHAOS

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TURB0B00ST API                       │
│                    (port 3002)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ L0RE Intel  │  │ d0t Intel   │  │ TURB0 Engine │    │
│  │ (Nash/Ent)  │  │ (Patterns)  │  │ (Decisions)  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│          │               │                │            │
│          └───────────────┼────────────────┘            │
│                          ▼                             │
│                 ┌─────────────────┐                    │
│                 │ Agent Consensus │                    │
│                 │ d0t|c0m|b0b|r0ss│                    │
│                 └─────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │   d0t-signals   │
                 │    (crawler)    │
                 └─────────────────┘
```

## Integration with d0t-vscode

The d0t-vscode extension polls this API for live signals display in the VS Code status bar:

- Shows decision (BUY/SELL/HOLD) with confidence
- Displays Nash equilibrium state
- Real-time updates every 60 seconds

## Security Notes

- 💀 c0m SECURITY: All transactions require human approval
- MAX_SINGLE_TRADE: 10% of portfolio
- STOP_LOSS: 5%
- TAKE_PROFIT: 15%
