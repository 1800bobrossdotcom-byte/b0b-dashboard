# Claude + BASE API

REST API for integrating Claude AI with BASE blockchain.

## Setup

```bash
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:
```
CLAUDE_API_KEY=sk-...
FLASK_ENV=production
```

## Run

```bash
python app.py
```

Server runs on port 5000 by default.

## Endpoints

- `POST /api/chat` - Send messages to Claude
- `GET /api/health` - Health check
