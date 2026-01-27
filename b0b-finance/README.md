# B0B Finance - Autonomous Wealth Engine

> *"All our b0ts learn from each other"* - Building wealth through intelligent automation

## Vision

B0B Finance is the proof of concept for **humans + AI working together for wealth abundance**:
- 🎯 **Fierce pragmatic trading** - No emotion, pure logic
- 💰 **Auto-bill payment** - Wins pay rent, internet, electricity
- 📊 **Debt elimination** - Systematic paydown strategy
- 🤖 **Bot collaboration** - D0T, Alfred, Bankrbot all working together

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    B0B Finance Hub                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐               │
│   │ Polymarket│   │ Bankrbot │   │  Crypto  │               │
│   │  Trading  │   │  Bridge  │   │ Exchange │               │
│   └─────┬────┘   └─────┬────┘   └─────┬────┘               │
│         │              │              │                      │
│         v              v              v                      │
│   ┌─────────────────────────────────────┐                   │
│   │         Execution Engine            │                   │
│   │    (Position sizing, risk mgmt)     │                   │
│   └─────────────────────────────────────┘                   │
│                        │                                     │
│                        v                                     │
│   ┌─────────────────────────────────────┐                   │
│   │          Wallet Manager             │                   │
│   │   (Track balances, allocations)     │                   │
│   └─────────────────────────────────────┘                   │
│                        │                                     │
│                        v                                     │
│   ┌─────────────────────────────────────┐                   │
│   │          Bill Autopay               │                   │
│   │  (Rent, Internet, Electric, Subs)   │                   │
│   └─────────────────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Modules

### 1. Polymarket Trader (`polymarket.js`)
- Fetch markets and odds
- Analyze sentiment & news
- Execute trades via API
- Track P&L

### 2. Bill Manager (`bills.js`)
- Define recurring bills
- Track due dates
- Auto-fund from wins
- Payment execution

### 3. Execution Engine (`engine.js`)
- Risk-per-trade limits
- Position sizing (Kelly criterion)
- Stop-loss / take-profit
- Portfolio rebalancing

### 4. Wallet Manager (`wallet.js`)
- Multi-chain balance tracking
- Allocation buckets (trading, bills, savings)
- Win/loss tracking
- Withdrawal to fiat

### 5. Dashboard (`dashboard.js`)
- Net worth tracking
- Debt paydown progress
- Monthly P&L
- Bill payment status

## Quick Start

```bash
cd c:\workspace\b0b-platform\b0b-finance

# Configure your accounts
cp config.example.json config.json
# Edit config.json with your API keys

# Start the finance hub
node index.js

# Or run specific modules
node polymarket.js watch        # Watch prediction markets
node bills.js status            # Check bill payment status
node engine.js analyze          # Get trading signals
```

## Bills Configuration

```json
{
  "bills": [
    { "name": "Rent", "amount": 1500, "dueDay": 1, "priority": 1 },
    { "name": "Internet", "amount": 80, "dueDay": 15, "priority": 2 },
    { "name": "Electric", "amount": 150, "dueDay": 20, "priority": 2 },
    { "name": "Subscriptions", "amount": 50, "dueDay": 1, "priority": 3 }
  ]
}
```

## Trading Rules (Fierce & Pragmatic)

1. **Never risk more than 2% per trade**
2. **Cut losses fast, let winners run**
3. **No revenge trading**
4. **Scale into winning positions**
5. **Pay bills FIRST, then trade with surplus**

## Integration with D0T

D0T can autonomously:
- Monitor market conditions
- Execute trades when signals trigger
- Check bill due dates
- Transfer funds for payments
- Report status to dashboard

## Security

- API keys stored in encrypted config
- Withdrawal limits enforced
- Multi-sig for large transfers
- Audit log for all transactions

## License

MIT - Part of the b0b-platform
