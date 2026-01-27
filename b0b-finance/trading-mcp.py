#!/usr/bin/env python3
"""
💹 TRADING D0T MCP SERVER
══════════════════════════════════════════════════════════════

Model Context Protocol server for autonomous trading.
Inspired by polymarket-mcp-server with 45 tools.

This provides Claude with direct trading capabilities:
- Market discovery & search
- Price analysis & orderbook
- Position management
- Trade execution (with safety limits)

Usage:
    python trading-mcp.py

Add to Claude Desktop config:
{
    "mcpServers": {
        "trading": {
            "command": "python",
            "args": ["path/to/trading-mcp.py"]
        }
    }
}
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Optional
import httpx

# Try to import MCP - if not available, we'll create a mock
try:
    from mcp.server import Server
    from mcp.types import Tool, TextContent
    MCP_AVAILABLE = True
except ImportError:
    MCP_AVAILABLE = False
    print("MCP not installed. Run: pip install mcp")

# ══════════════════════════════════════════════════════════════
# SAFETY LIMITS
# ══════════════════════════════════════════════════════════════

SAFETY = {
    "MAX_ORDER_SIZE_USD": 500,
    "MAX_TOTAL_EXPOSURE_USD": 2000,
    "MAX_POSITION_PER_MARKET": 500,
    "MIN_LIQUIDITY_REQUIRED": 5000,
    "MAX_SPREAD_TOLERANCE": 0.05,
    "REQUIRE_CONFIRMATION_ABOVE": 200,
    "DEMO_MODE": True,  # Safe by default
}

# ══════════════════════════════════════════════════════════════
# POLYMARKET CLIENT
# ══════════════════════════════════════════════════════════════

class PolymarketClient:
    CLOB_HOST = "https://clob.polymarket.com"
    GAMMA_HOST = "https://gamma-api.polymarket.com"
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_markets(self, limit: int = 50, category: str = None) -> list:
        """Get list of active markets."""
        params = {"limit": limit, "active": "true", "closed": "false"}
        if category:
            params["tag"] = category
        
        response = await self.client.get(f"{self.GAMMA_HOST}/markets", params=params)
        response.raise_for_status()
        return response.json()
    
    async def search_markets(self, query: str) -> list:
        """Search markets by keyword."""
        markets = await self.get_markets(100)
        query_lower = query.lower()
        return [
            m for m in markets
            if query_lower in (m.get("question", "") or "").lower()
            or query_lower in (m.get("slug", "") or "").lower()
        ]
    
    async def get_market(self, market_id: str) -> dict:
        """Get specific market details."""
        response = await self.client.get(f"{self.GAMMA_HOST}/markets/{market_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_orderbook(self, token_id: str) -> dict:
        """Get orderbook for a token."""
        response = await self.client.get(
            f"{self.CLOB_HOST}/book",
            params={"token_id": token_id}
        )
        response.raise_for_status()
        return response.json()
    
    async def get_midpoint(self, token_id: str) -> float:
        """Get midpoint price for a token."""
        response = await self.client.get(
            f"{self.CLOB_HOST}/midpoint",
            params={"token_id": token_id}
        )
        response.raise_for_status()
        data = response.json()
        return float(data.get("mid", 0.5))
    
    async def get_spread(self, token_id: str) -> dict:
        """Get bid-ask spread for a token."""
        response = await self.client.get(
            f"{self.CLOB_HOST}/spread",
            params={"token_id": token_id}
        )
        response.raise_for_status()
        return response.json()
    
    async def get_price_history(self, token_id: str, interval: str = "1h") -> list:
        """Get price history for analysis."""
        response = await self.client.get(
            f"{self.CLOB_HOST}/prices-history",
            params={"market": token_id, "interval": interval}
        )
        if response.status_code == 200:
            return response.json().get("history", [])
        return []


# ══════════════════════════════════════════════════════════════
# TRADING TOOLS
# ══════════════════════════════════════════════════════════════

client = PolymarketClient()
state = {
    "positions": [],
    "total_exposure": 0,
    "trades_today": 0,
}


async def tool_get_trending_markets(limit: int = 10, category: str = None) -> str:
    """
    Get trending markets sorted by 24h volume.
    
    Args:
        limit: Number of markets to return (default 10)
        category: Filter by category (politics, crypto, sports, etc.)
    """
    markets = await client.get_markets(limit * 2, category)
    
    # Sort by volume
    markets.sort(key=lambda m: float(m.get("volume24hr", 0) or 0), reverse=True)
    markets = markets[:limit]
    
    result = "📊 TRENDING MARKETS\n" + "=" * 50 + "\n\n"
    
    for i, m in enumerate(markets, 1):
        question = (m.get("question") or "Unknown")[:60]
        volume = float(m.get("volume24hr", 0) or 0)
        yes_price = float(m.get("outcomePrices", [0.5])[0] or 0.5)
        
        result += f"{i}. {question}...\n"
        result += f"   YES: {yes_price:.1%} | Volume 24h: ${volume:,.0f}\n"
        result += f"   ID: {m.get('conditionId', m.get('id', 'N/A'))}\n\n"
    
    return result


async def tool_search_markets(query: str) -> str:
    """
    Search for markets by keyword.
    
    Args:
        query: Search term (e.g., "bitcoin", "trump", "nba")
    """
    markets = await client.search_markets(query)
    
    if not markets:
        return f"No markets found for '{query}'"
    
    result = f"🔍 SEARCH RESULTS FOR '{query}'\n" + "=" * 50 + "\n\n"
    
    for m in markets[:10]:
        question = (m.get("question") or "Unknown")[:60]
        yes_price = float(m.get("outcomePrices", [0.5])[0] or 0.5)
        volume = float(m.get("volume24hr", 0) or 0)
        
        result += f"• {question}...\n"
        result += f"  YES: {yes_price:.1%} | Volume: ${volume:,.0f}\n"
        result += f"  ID: {m.get('conditionId', m.get('id', 'N/A'))}\n\n"
    
    return result


async def tool_analyze_market(market_id: str) -> str:
    """
    Deep analysis of a specific market with AI recommendations.
    
    Args:
        market_id: The market condition ID
    """
    try:
        market = await client.get_market(market_id)
    except:
        return f"Market not found: {market_id}"
    
    question = market.get("question", "Unknown")
    yes_price = float(market.get("outcomePrices", [0.5])[0] or 0.5)
    no_price = 1 - yes_price
    volume24h = float(market.get("volume24hr", 0) or 0)
    volume_total = float(market.get("volume", 0) or 0)
    liquidity = float(market.get("liquidity", 0) or 0)
    end_date = market.get("endDate", "Unknown")
    
    # Get orderbook if available
    token_id = None
    tokens = market.get("tokens", [])
    if tokens:
        token_id = tokens[0].get("token_id")
    
    spread = 0.05
    if token_id:
        try:
            spread_data = await client.get_spread(token_id)
            bid = float(spread_data.get("bid", 0) or 0)
            ask = float(spread_data.get("ask", 1) or 1)
            spread = ask - bid
        except:
            pass
    
    # Generate AI recommendation
    recommendation = "HOLD"
    edge = abs(yes_price - 0.5) * 2  # Distance from 50/50
    
    if spread < 0.02 and liquidity > 10000:
        if yes_price < 0.2 or yes_price > 0.8:
            recommendation = "CONSIDER FADE"  # Bet against extreme odds
        elif 0.4 < yes_price < 0.6:
            recommendation = "WAIT FOR CATALYST"
    elif spread > 0.05:
        recommendation = "AVOID - HIGH SPREAD"
    elif liquidity < 5000:
        recommendation = "AVOID - LOW LIQUIDITY"
    
    result = f"""
📊 MARKET ANALYSIS
{'=' * 50}

🎯 {question}

💰 PRICING
   YES: {yes_price:.1%} | NO: {no_price:.1%}
   Spread: {spread:.2%}
   
📈 VOLUME
   24h: ${volume24h:,.0f}
   Total: ${volume_total:,.0f}
   Liquidity: ${liquidity:,.0f}

📅 Resolution: {end_date}

🤖 AI RECOMMENDATION: {recommendation}

⚠️ SAFETY CHECK
   Spread OK: {'✅' if spread < SAFETY['MAX_SPREAD_TOLERANCE'] else '❌'} ({spread:.2%} vs {SAFETY['MAX_SPREAD_TOLERANCE']:.0%} max)
   Liquidity OK: {'✅' if liquidity > SAFETY['MIN_LIQUIDITY_REQUIRED'] else '❌'} (${liquidity:,.0f} vs ${SAFETY['MIN_LIQUIDITY_REQUIRED']:,} min)
"""
    return result


async def tool_get_orderbook(token_id: str, depth: int = 5) -> str:
    """
    Get orderbook depth for a token.
    
    Args:
        token_id: The token ID
        depth: Number of levels to show (default 5)
    """
    try:
        book = await client.get_orderbook(token_id)
    except Exception as e:
        return f"Error fetching orderbook: {e}"
    
    bids = book.get("bids", [])[:depth]
    asks = book.get("asks", [])[:depth]
    
    result = f"📖 ORDERBOOK ({token_id[:16]}...)\n" + "=" * 50 + "\n\n"
    
    result += "ASKS (Sellers)\n"
    for ask in reversed(asks):
        price = float(ask.get("price", 0))
        size = float(ask.get("size", 0))
        result += f"  ${price:.4f}  |  {size:,.0f} tokens\n"
    
    result += "\n" + "-" * 30 + "\n\n"
    
    result += "BIDS (Buyers)\n"
    for bid in bids:
        price = float(bid.get("price", 0))
        size = float(bid.get("size", 0))
        result += f"  ${price:.4f}  |  {size:,.0f} tokens\n"
    
    # Calculate spread
    if bids and asks:
        best_bid = float(bids[0].get("price", 0))
        best_ask = float(asks[0].get("price", 1))
        spread = best_ask - best_bid
        result += f"\nSpread: {spread:.2%}"
    
    return result


async def tool_simulate_trade(
    market_id: str,
    side: str,
    amount_usd: float
) -> str:
    """
    Simulate a trade without executing (paper trading).
    Shows what would happen if you placed this order.
    
    Args:
        market_id: The market condition ID
        side: "YES" or "NO"
        amount_usd: Amount in USD to trade
    """
    # Safety checks
    if amount_usd > SAFETY["MAX_ORDER_SIZE_USD"]:
        return f"❌ BLOCKED: Order size ${amount_usd} exceeds max ${SAFETY['MAX_ORDER_SIZE_USD']}"
    
    if state["total_exposure"] + amount_usd > SAFETY["MAX_TOTAL_EXPOSURE_USD"]:
        return f"❌ BLOCKED: Would exceed max exposure ${SAFETY['MAX_TOTAL_EXPOSURE_USD']}"
    
    try:
        market = await client.get_market(market_id)
    except:
        return f"Market not found: {market_id}"
    
    yes_price = float(market.get("outcomePrices", [0.5])[0] or 0.5)
    price = yes_price if side.upper() == "YES" else (1 - yes_price)
    
    # Calculate tokens received
    tokens = amount_usd / price
    
    # Calculate potential profit/loss
    max_profit = tokens - amount_usd  # If resolves in your favor
    max_loss = amount_usd  # If resolves against you
    
    result = f"""
🎯 TRADE SIMULATION (Paper Trading)
{'=' * 50}

📊 Market: {market.get('question', 'Unknown')[:50]}...

💼 ORDER DETAILS
   Side: {side.upper()}
   Amount: ${amount_usd:,.2f}
   Price: {price:.2%}
   Tokens: {tokens:,.2f}

📈 POTENTIAL OUTCOMES
   Max Profit: ${max_profit:,.2f} (if {side.upper()} wins)
   Max Loss: ${max_loss:,.2f} (if {side.upper()} loses)
   Risk/Reward: 1:{max_profit/max_loss:.2f}

⚠️ SAFETY STATUS
   Order Size: {'✅' if amount_usd <= SAFETY['MAX_ORDER_SIZE_USD'] else '❌'}
   Exposure: {'✅' if state['total_exposure'] + amount_usd <= SAFETY['MAX_TOTAL_EXPOSURE_USD'] else '❌'}
   
🔒 MODE: {'DEMO (no real money)' if SAFETY['DEMO_MODE'] else 'LIVE TRADING'}

{'✅ Trade simulation complete. No funds were used.' if SAFETY['DEMO_MODE'] else '⚠️ This would execute a REAL trade!'}
"""
    return result


async def tool_get_portfolio() -> str:
    """
    Get current portfolio status and positions.
    """
    result = f"""
💼 PORTFOLIO STATUS
{'=' * 50}

💰 EXPOSURE
   Total: ${state['total_exposure']:,.2f}
   Max Allowed: ${SAFETY['MAX_TOTAL_EXPOSURE_USD']:,.2f}
   Available: ${SAFETY['MAX_TOTAL_EXPOSURE_USD'] - state['total_exposure']:,.2f}

📊 POSITIONS ({len(state['positions'])})
"""
    
    if not state["positions"]:
        result += "   No active positions\n"
    else:
        for pos in state["positions"]:
            result += f"   • {pos.get('market', 'Unknown')[:30]}...\n"
            result += f"     Side: {pos.get('side')} | Size: ${pos.get('size', 0):,.2f}\n"
    
    result += f"""
🛡️ SAFETY LIMITS
   Max Order: ${SAFETY['MAX_ORDER_SIZE_USD']:,}
   Max Position: ${SAFETY['MAX_POSITION_PER_MARKET']:,}
   Max Spread: {SAFETY['MAX_SPREAD_TOLERANCE']:.0%}
   Min Liquidity: ${SAFETY['MIN_LIQUIDITY_REQUIRED']:,}
   
🔒 Mode: {'DEMO' if SAFETY['DEMO_MODE'] else 'LIVE'}
"""
    return result


# ══════════════════════════════════════════════════════════════
# MCP SERVER SETUP
# ══════════════════════════════════════════════════════════════

TOOLS = {
    "get_trending_markets": {
        "description": "Get trending prediction markets sorted by 24h volume",
        "parameters": {
            "limit": {"type": "integer", "default": 10},
            "category": {"type": "string", "optional": True},
        },
        "handler": tool_get_trending_markets,
    },
    "search_markets": {
        "description": "Search for markets by keyword (bitcoin, trump, nba, etc.)",
        "parameters": {
            "query": {"type": "string", "required": True},
        },
        "handler": tool_search_markets,
    },
    "analyze_market": {
        "description": "Deep analysis of a market with AI recommendations",
        "parameters": {
            "market_id": {"type": "string", "required": True},
        },
        "handler": tool_analyze_market,
    },
    "get_orderbook": {
        "description": "Get orderbook depth showing bids and asks",
        "parameters": {
            "token_id": {"type": "string", "required": True},
            "depth": {"type": "integer", "default": 5},
        },
        "handler": tool_get_orderbook,
    },
    "simulate_trade": {
        "description": "Simulate a trade without executing (paper trading)",
        "parameters": {
            "market_id": {"type": "string", "required": True},
            "side": {"type": "string", "enum": ["YES", "NO"], "required": True},
            "amount_usd": {"type": "number", "required": True},
        },
        "handler": tool_simulate_trade,
    },
    "get_portfolio": {
        "description": "Get current portfolio status, positions, and safety limits",
        "parameters": {},
        "handler": tool_get_portfolio,
    },
}


def create_server():
    """Create and configure the MCP server."""
    if not MCP_AVAILABLE:
        print("MCP not available - running in standalone mode")
        return None
    
    server = Server("trading-d0t")
    
    @server.list_tools()
    async def list_tools():
        return [
            Tool(
                name=name,
                description=info["description"],
                inputSchema={
                    "type": "object",
                    "properties": info["parameters"],
                }
            )
            for name, info in TOOLS.items()
        ]
    
    @server.call_tool()
    async def call_tool(name: str, arguments: dict):
        if name not in TOOLS:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]
        
        handler = TOOLS[name]["handler"]
        result = await handler(**arguments)
        return [TextContent(type="text", text=result)]
    
    return server


# ══════════════════════════════════════════════════════════════
# CLI MODE (for testing without MCP)
# ══════════════════════════════════════════════════════════════

async def cli_mode():
    """Run in CLI mode for testing."""
    print("""
💹 TRADING D0T MCP SERVER - CLI Mode
══════════════════════════════════════════════════════════════

Commands:
  trending [limit]              - Get trending markets
  search <query>                - Search markets
  analyze <market_id>           - Analyze a market
  orderbook <token_id>          - Get orderbook
  simulate <market_id> <YES|NO> <amount>  - Simulate trade
  portfolio                     - View portfolio
  quit                          - Exit

""")
    
    while True:
        try:
            cmd = input("trading-d0t> ").strip().split()
            if not cmd:
                continue
            
            action = cmd[0].lower()
            
            if action == "quit" or action == "exit":
                break
            elif action == "trending":
                limit = int(cmd[1]) if len(cmd) > 1 else 10
                print(await tool_get_trending_markets(limit))
            elif action == "search":
                query = " ".join(cmd[1:])
                print(await tool_search_markets(query))
            elif action == "analyze":
                market_id = cmd[1]
                print(await tool_analyze_market(market_id))
            elif action == "orderbook":
                token_id = cmd[1]
                print(await tool_get_orderbook(token_id))
            elif action == "simulate":
                market_id = cmd[1]
                side = cmd[2].upper()
                amount = float(cmd[3])
                print(await tool_simulate_trade(market_id, side, amount))
            elif action == "portfolio":
                print(await tool_get_portfolio())
            else:
                print(f"Unknown command: {action}")
                
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")


async def main():
    """Main entry point."""
    import sys
    
    if "--cli" in sys.argv or not MCP_AVAILABLE:
        await cli_mode()
    else:
        server = create_server()
        if server:
            async with server:
                await server.serve()
        else:
            await cli_mode()


if __name__ == "__main__":
    asyncio.run(main())
