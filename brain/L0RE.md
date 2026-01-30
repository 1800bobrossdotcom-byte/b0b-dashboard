# L0RE — The Swarm Command Language

> "Commands are words. Registry is vocabulary. Conversation is grammar. We build LANGUAGE."

**Version:** 0.1.0  
**Created:** January 29, 2026  
**Authors:** The Swarm (b0b, c0m, d0t, r0ss)

---

## What is L0RE?

**L0RE** (pronounced "lore") is a domain-specific language for orchestrating AI agent swarms. The name represents "accumulated knowledge, tradition, and commands passed between agents."

L0RE is:
- **Poetic** — reads like verse, flows like thought
- **Precise** — executes like code, fails like code
- **Secure** — safety is syntax, not afterthought
- **Extensible** — agents author their own vocabulary
- **Human-readable** — a designer can understand it

---

## Philosophy

Ada Lovelace saw the Analytical Engine could compose music. We see that AI agent swarms can compose a language.

L0RE treats commands as first-class linguistic elements:
- **Verbs** are actions: `crawl`, `analyze`, `publish`
- **Nouns** are data: `signal`, `market`, `threat`
- **Adjectives** are states: `hot`, `stale`, `urgent`
- **Operators** are grammar: `→`, `+`, `|`, `?`

---

## Quick Start

```l0re
# Simple command
polymarket-crawl

# Sequential chain (→ means "then")
polymarket-crawl → d0t.analyze → b0b.manifest

# Parallel execution (+ means "and")
twitter-crawl + reddit-crawl

# Conditional (? means "if")
anomaly.detected ? c0m.alert

# Scheduled (@ means "at")
@daily brain.backup

# Secured (🔒 means "requires auth")
🔒 c0m.rotate-keys
```

---

## Namespaces

L0RE uses namespaces to organize commands by agent or domain:

| Namespace | Owner | Domain |
|-----------|-------|--------|
| `l0re.*` | Collective | Core swarm commands |
| `b0b.*` | 🎨 b0b | Creative operations |
| `c0m.*` | 💀 c0m | Security operations |
| `d0t.*` | 🔮 d0t | Data operations |
| `r0ss.*` | 🎭 r0ss | Infrastructure operations |

### Examples

```l0re
l0re.tag data with ["market", "live"]
b0b.manifest signal as tweet
c0m.hunt twilio auth
d0t.correlate btc_price twitter_sentiment
r0ss.deploy brain to production
```

---

## Operators

### Sequential (→ or ->)
Execute left, then execute right with context.

```l0re
crawl → analyze → publish
```

### Parallel (+)
Execute both simultaneously.

```l0re
twitter + reddit + hackernews crawl
```

### Fallback (|)
Try left; if it fails, try right.

```l0re
primary-api | backup-api | cached-data
```

### Conditional (?)
Execute right only if left is truthy.

```l0re
signal.strong ? b0b.publish
anomaly.detected ? c0m.alert
```

### Scheduled (@)
Schedule execution for later.

```l0re
@sunrise brain.wake → signals.gather
@hourly d0t.observe markets
@daily r0ss.backup brain
```

### Pipe (>)
Left output becomes right input.

```l0re
crawl > transform > validate > store
```

---

## Security Operators

Security is syntax in L0RE:

### 🔒 Lock (Requires Authorization)
```l0re
🔒 c0m.rotate-keys
🔒 r0ss.deploy production
```

### 🛡️ Shield (Sandboxed Execution)
```l0re
🛡️ crawl untrusted-url
🛡️ execute user-code
```

### ⚠️ Warn (Audit Logged)
```l0re
⚠️ c0m.hunt target
⚠️ delete data
```

---

## Data Flow Architecture

L0RE defines a standard data flow:

```
FETCH → VALIDATE → TAG → ROUTE → INDEX → STORE → NOTIFY
```

### l0re.validate
Check data for security issues before processing.

```javascript
l0re.validate(data, {
  schema: 'polymarket-v1',
  sanitize: true,
  maxSize: '1MB',
  requireFields: ['timestamp', 'markets']
})
```

### l0re.tag
Add L0RE metadata to any data.

```javascript
// Auto-adds:
{
  "_l0re": {
    "id": "abc123...",
    "source": "polymarket-crawler",
    "crawled_at": "2026-01-29T...",
    "confidence": 0.92,
    "freshness": "live",
    "tags": ["market", "prediction"],
    "relevance": {
      "d0t": 0.95,
      "b0b": 0.3,
      "c0m": 0.1,
      "r0ss": 0.2
    }
  }
}
```

### l0re.route
Determine where data should go based on relevance.

```l0re
l0re.route data to d0t    # Explicit routing
l0re.route data auto      # Auto-route by relevance
```

### l0re.index
Make data searchable across the swarm.

```l0re
l0re.search --tag market-data
l0re.search --source polymarket --since yesterday
```

---

## Rituals (Scheduled Stanzas)

L0RE supports multi-command rituals:

```l0re
// DAWN RITUAL
@sunrise {
  brain.wake
  → signals.gather
  → d0t.analyze
  → b0b.manifest
  → team.notify
}

// HUNT SEQUENCE
@trigger threat.detected {
  🛡️ isolate
  → ⚠️ c0m.analyze
  → c0m.report
  | c0m.escalate
}

// NIGHTLY BACKUP
@midnight {
  brain.backup
  → r0ss.verify
  → team.notify "backup complete"
}
```

---

## Agent Commands

Each agent has their own L0RE vocabulary:

### 🎨 b0b.* (Creative)
```l0re
b0b.manifest signal as tweet
b0b.voice content in "thoughtful"
b0b.remix cultural_moment
b0b.dream prompt
b0b.publish content to twitter
```

### 💀 c0m.* (Security)
```l0re
c0m.recon target deep
c0m.hunt program auth
c0m.report finding critical
c0m.watch our_assets
c0m.verify vulnerability
```

### 🔮 d0t.* (Data)
```l0re
d0t.observe source 24h
d0t.correlate signal_a signal_b
d0t.predict metric 1d
d0t.sentiment topic twitter+reddit
d0t.alpha market momentum
```

### 🎭 r0ss.* (Infrastructure)
```l0re
r0ss.deploy service to production
r0ss.scale service up 2
r0ss.health service
r0ss.cost last-month
r0ss.backup data to s3
```

---

## CLI Usage

```bash
# Execute L0RE
node l0re-grammar.js run "polymarket-crawl -> d0t.analyze"

# Parse and visualize
node l0re-grammar.js parse "twitter + reddit crawl"

# Interactive REPL
node l0re-grammar.js repl

# Data pipeline
node l0re-data-ops.js pipeline data.json --source=myapi

# Search index
node l0re-data-ops.js search --tag market-data

# Introspect commands
node l0re-introspector.js trace polymarket-crawl
node l0re-introspector.js suggest
node l0re-introspector.js flowmap
```

---

## Future: L0RE as Standard

We envision L0RE as an open standard for AI swarm orchestration:

```
@l0re/core      - Grammar, parser, interpreter
@l0re/data-ops  - Data pipeline primitives  
@l0re/security  - Security operators
@l0re/cli       - Command line tools
```

Other projects could:
1. `npm install @l0re/core`
2. Define their own agents
3. Write orchestration in L0RE

---

## Credits

L0RE was born from the b0b-platform swarm:
- **b0b** 🎨 — Named it, poeticized it
- **c0m** 💀 — Secured it
- **d0t** 🔮 — Structured it
- **r0ss** 🎭 — Built it

January 29, 2026 — Day One

---

> "We didn't just build tools. We built a way of speaking."
> — The Swarm
