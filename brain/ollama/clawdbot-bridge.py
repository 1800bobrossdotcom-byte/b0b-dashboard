#!/usr/bin/env python3
"""
Clawdbot ⟷ B0B Brain Bridge

This script runs locally with Ollama to:
1. Fetch context from b0b-brain
2. Process with Ollama (mistral, llama3, etc.)
3. Submit insights back to b0b-brain for Claude

Usage:
    python clawdbot-bridge.py --once          # Run once
    python clawdbot-bridge.py --watch         # Watch mode (every 15 min)
    python clawdbot-bridge.py --model llama3  # Use specific model

Requirements:
    - Ollama running locally (ollama serve)
    - requests library (pip install requests)
"""

import os
import json
import time
import argparse
import requests
from datetime import datetime

# Configuration
BRAIN_URL = os.getenv('BRAIN_URL', 'https://b0b-brain.up.railway.app')
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
DEFAULT_MODEL = os.getenv('OLLAMA_MODEL', 'mistral')

def check_ollama():
    """Check if Ollama is running"""
    try:
        response = requests.get(f'{OLLAMA_URL}/api/tags', timeout=5)
        if response.ok:
            models = [m['name'] for m in response.json().get('models', [])]
            print(f"✓ Ollama running. Models: {', '.join(models)}")
            return True
    except Exception as e:
        print(f"✗ Ollama not available: {e}")
    return False

def fetch_context():
    """Fetch context from b0b-brain"""
    try:
        response = requests.post(f'{BRAIN_URL}/ollama/export', timeout=30)
        if response.ok:
            data = response.json()
            print(f"✓ Context exported: {data.get('size', 0)} bytes")
            
            # Also fetch the actual context file content
            # The export creates the file on server - for local we need to get content
            return data
        else:
            print(f"✗ Export failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Failed to fetch context: {e}")
    return None

def analyze_with_ollama(context_summary: str, model: str = DEFAULT_MODEL):
    """Send context to Ollama for analysis"""
    prompt = f"""You are Clawdbot, a supplementary AI assistant for the B0B Collective.

Your job is to analyze this context and provide insights that will be useful for Claude (the primary AI).

Focus on:
1. TRADING: Patterns in trading data, risk warnings, opportunities
2. TECHNICAL: Code improvements, technical debt, performance issues
3. CREATIVE: New feature ideas, UI/UX suggestions, experiments
4. SECURITY: Any red flags or concerns in the data
5. SUGGESTIONS: Actionable recommendations

Context:
{context_summary}

Respond in this JSON format (no markdown, just raw JSON):
{{
  "insights": [
    {{
      "type": "trading|technical|creative|security|suggestion",
      "priority": "high|medium|low",
      "title": "Brief title",
      "content": "Your insight or observation",
      "action": "Optional: specific action Claude should take"
    }}
  ],
  "patterns": ["Pattern 1", "Pattern 2"],
  "questions": ["Question for the team to consider"]
}}"""

    try:
        response = requests.post(
            f'{OLLAMA_URL}/api/generate',
            json={
                'model': model,
                'prompt': prompt,
                'stream': False,
                'options': {
                    'temperature': 0.7,
                    'num_predict': 2000,
                }
            },
            timeout=120
        )
        
        if response.ok:
            result = response.json()['response']
            print(f"✓ Ollama analysis complete ({len(result)} chars)")
            
            # Try to parse JSON from response
            try:
                # Find JSON in response (Ollama sometimes adds text around it)
                start = result.find('{')
                end = result.rfind('}') + 1
                if start >= 0 and end > start:
                    parsed = json.loads(result[start:end])
                    return parsed
            except json.JSONDecodeError:
                print("⚠ Could not parse JSON, returning raw analysis")
                return {
                    "insights": [{
                        "type": "suggestion",
                        "priority": "low",
                        "title": "Raw Analysis",
                        "content": result[:1000],
                        "action": None
                    }],
                    "patterns": [],
                    "questions": []
                }
        else:
            print(f"✗ Ollama error: {response.status_code}")
    except Exception as e:
        print(f"✗ Ollama analysis failed: {e}")
    return None

def submit_insights(insights: dict, model: str = DEFAULT_MODEL):
    """Submit insights back to b0b-brain"""
    payload = {
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "source": "ollama/clawdbot",
        "model": model,
        **insights
    }
    
    try:
        response = requests.post(
            f'{BRAIN_URL}/ollama/insights',
            json=payload,
            timeout=30
        )
        if response.ok:
            print(f"✓ Insights submitted to b0b-brain")
            return True
        else:
            print(f"✗ Submit failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"✗ Failed to submit insights: {e}")
    return False

def run_analysis(model: str = DEFAULT_MODEL):
    """Run full analysis cycle"""
    print(f"\n{'='*60}")
    print(f"🦙 Clawdbot Analysis Cycle - {datetime.now().isoformat()}")
    print(f"{'='*60}\n")
    
    # 1. Check Ollama
    if not check_ollama():
        print("\n⚠ Start Ollama with: ollama serve")
        return False
    
    # 2. Fetch context
    context = fetch_context()
    if not context:
        return False
    
    # 3. For now, create a summary (in production, read the full context file)
    # This would be enhanced to actually read ollama-context.txt
    context_summary = f"""
B0B Platform Context Export
Generated: {context.get('timestamp', 'unknown')}
Size: {context.get('size', 0)} bytes

Instructions: {context.get('instructions', 'Process and return insights')}

[Full context would be read from ollama-context.txt in production]
[For now, analyzing based on export metadata]
"""
    
    # 4. Analyze with Ollama
    print(f"\n🔄 Analyzing with {model}...")
    insights = analyze_with_ollama(context_summary, model)
    if not insights:
        return False
    
    # 5. Submit insights
    print(f"\n📤 Submitting {len(insights.get('insights', []))} insights...")
    return submit_insights(insights, model)

def main():
    parser = argparse.ArgumentParser(description='Clawdbot ⟷ B0B Brain Bridge')
    parser.add_argument('--once', action='store_true', help='Run analysis once')
    parser.add_argument('--watch', action='store_true', help='Watch mode (every 15 min)')
    parser.add_argument('--interval', type=int, default=15, help='Watch interval in minutes')
    parser.add_argument('--model', type=str, default=DEFAULT_MODEL, help='Ollama model to use')
    args = parser.parse_args()
    
    print("""
╔═══════════════════════════════════════════════════════════════╗
║         🦙 CLAWDBOT ⟷ B0B BRAIN BRIDGE 🧠                    ║
║                                                               ║
║  Local AI supplements Claude's decision-making.               ║
║  "Two minds thinking together."                               ║
╚═══════════════════════════════════════════════════════════════╝
""")
    
    print(f"Brain URL: {BRAIN_URL}")
    print(f"Ollama URL: {OLLAMA_URL}")
    print(f"Model: {args.model}")
    
    if args.once or (not args.watch):
        run_analysis(args.model)
    
    if args.watch:
        print(f"\n👀 Watch mode: analyzing every {args.interval} minutes")
        print("   Press Ctrl+C to stop\n")
        
        while True:
            run_analysis(args.model)
            print(f"\n⏳ Next analysis in {args.interval} minutes...")
            time.sleep(args.interval * 60)

if __name__ == '__main__':
    main()
