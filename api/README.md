# b0b.dev API v3.0

🧠 **Swarm Intelligence Gateway** — Connects the dashboard to the brain

## The Problem (v2.x)
The old API was useless because it:
- Only had a basic Claude chat endpoint
- Didn't connect to the brain server
- Had placeholder "coming soon" for BASE balance
- Dashboard couldn't get real swarm data

## The Solution (v3.0)
Now the API proxies the brain server, providing:
- Real-time agent states (d0t, b0b, r0ss, c0m)
- Treasury balance from BASE chain
- D0T market signals and predictions
- TURB0 trading decisions
- Swarm chat interface
- Crawler status

## Endpoints

### Core
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info and endpoint list |
| `/api/health` | GET | Health check |
| `/api/chat` | POST | Chat with Claude AI |
| `/api/v1/status` | GET | Platform status |

### Swarm (NEW 🆕)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/swarm/pulse` | GET | 🧠 Full swarm status |
| `/api/swarm/agents` | GET | 🤖 Agent states |
| `/api/swarm/treasury` | GET | 💰 Treasury balance |
| `/api/swarm/signals` | GET | 📡 D0T market signals |
| `/api/swarm/chat` | POST | 💬 Chat with swarm |
| `/api/swarm/tasks` | GET | 📋 Pending tasks |
| `/api/swarm/turb0` | GET | ⚡ TURB0 trading |
| `/api/crawlers` | GET | 🔄 Crawler status |

## Environment Variables

```bash
CLAUDE_API_KEY=sk-ant-api03-...     # Claude API key
BRAIN_URL=https://brain.b0b.dev     # Brain server URL
PORT=5000                            # API port
FLASK_ENV=development               # Enable localhost CORS
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Dashboard  │────▶│   API       │────▶│   Brain     │
│  b0b.dev/hq │     │ api.b0b.dev │     │ brain.b0b   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │   Claude    │
                    │     AI      │
                    └─────────────┘
```

## Deployment
Deployed to Railway as api.b0b.dev

## Local Development

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

## Security
- Rate limiting per IP
- CORS allowlist only
- Input sanitization  
- Timing attack prevention
- Honeypot endpoints
