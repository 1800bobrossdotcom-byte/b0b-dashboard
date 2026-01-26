# b0b.dev API

Claude AI + BASE Blockchain API service for b0b.dev

## Endpoints
- `/api/chat` - Ask Claude AI questions
- `/api/health` - Health check
- `/api/base/balance/{address}` - Get BASE balance
- `/api/claude/models` - List available Claude models

## Deployment
Deployed to Railway as api.b0b.dev

## Setup

```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:
```
CLAUDE_API_KEY=sk-ant-api03-...
PORT=5000
```

## Run

```bash
python app.py
```
