#!/usr/bin/env python3
"""
B0B Polymarket Trader - Python Execution Engine
═══════════════════════════════════════════════════════════════

Uses official py-clob-client for actual trade execution.
D0T can call this for autonomous trading.

Usage:
    python trader.py status              - Check connection
    python trader.py markets             - List hot markets  
    python trader.py buy <token> <$>     - Buy position
    python trader.py sell <token>        - Sell position
    python trader.py watch <token>       - Monitor price
"""

import os
import sys
import json
import time
from datetime import datetime
from pathlib import Path

# Try to import py-clob-client
try:
    from py_clob_client.client import ClobClient
    from py_clob_client.clob_types import OrderArgs, MarketOrderArgs, OrderType, OpenOrderParams
    from py_clob_client.order_builder.constants import BUY, SELL
    HAS_CLOB = True
except ImportError:
    HAS_CLOB = False
    print("⚠️  py-clob-client not installed. Run: pip install py-clob-client")

# ═══════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════

CONFIG = {
    "host": "https://clob.polymarket.com",
    "gamma_host": "https://gamma-api.polymarket.com",
    "chain_id": 137,  # Polygon
    
    # Trading rules (FIERCE & PRAGMATIC)
    "max_risk_per_trade": 0.02,  # 2%
    "min_edge": 0.05,            # 5%
    "max_position_size": 0.10,   # 10%
    
    # Files
    "config_file": Path(__file__).parent / "config.json",
    "positions_file": Path(__file__).parent / "positions.json",
    "history_file": Path(__file__).parent / "trade-history.json",
}

# ═══════════════════════════════════════════════════════════════
# TRADER CLASS
# ═══════════════════════════════════════════════════════════════

class B0BTrader:
    def __init__(self):
        self.client = None
        self.authenticated = False
        self.load_config()
    
    def load_config(self):
        """Load API credentials from config.json"""
        if CONFIG["config_file"].exists():
            with open(CONFIG["config_file"]) as f:
                self.config = json.load(f)
        else:
            self.config = {}
    
    def connect(self, auth=False):
        """Connect to Polymarket CLOB"""
        if not HAS_CLOB:
            print("❌ py-clob-client required for trading")
            return False
        
        if auth and self.config.get("private_key"):
            # Authenticated client for trading
            self.client = ClobClient(
                CONFIG["host"],
                key=self.config["private_key"],
                chain_id=CONFIG["chain_id"],
                signature_type=self.config.get("signature_type", 0),
                funder=self.config.get("funder_address")
            )
            self.client.set_api_creds(self.client.create_or_derive_api_creds())
            self.authenticated = True
            print("✅ Connected with trading enabled")
        else:
            # Read-only client
            self.client = ClobClient(CONFIG["host"])
            print("✅ Connected (read-only)")
        
        return True
    
    # ═══════════════════════════════════════════════════════════
    # READ-ONLY METHODS
    # ═══════════════════════════════════════════════════════════
    
    def get_status(self):
        """Check API status"""
        ok = self.client.get_ok()
        time_resp = self.client.get_server_time()
        return {"ok": ok, "time": time_resp}
    
    def get_markets(self, limit=20):
        """Get simplified markets"""
        return self.client.get_simplified_markets()
    
    def get_price(self, token_id, side="BUY"):
        """Get current price"""
        return self.client.get_price(token_id, side=side)
    
    def get_midpoint(self, token_id):
        """Get midpoint price"""
        return self.client.get_midpoint(token_id)
    
    def get_order_book(self, token_id):
        """Get full order book"""
        return self.client.get_order_book(token_id)
    
    def analyze_market(self, token_id):
        """Analyze a market for trading opportunity"""
        mid = float(self.get_midpoint(token_id).get("mid", 0))
        book = self.get_order_book(token_id)
        
        best_bid = float(book.get("bids", [{}])[0].get("price", 0)) if book.get("bids") else 0
        best_ask = float(book.get("asks", [{}])[0].get("price", 0)) if book.get("asks") else 0
        spread = best_ask - best_bid
        
        bid_depth = sum(float(b.get("size", 0)) for b in book.get("bids", [])[:5])
        ask_depth = sum(float(a.get("size", 0)) for a in book.get("asks", [])[:5])
        
        return {
            "token_id": token_id,
            "midpoint": mid,
            "best_bid": best_bid,
            "best_ask": best_ask,
            "spread": spread,
            "spread_pct": (spread / mid * 100) if mid else 0,
            "bid_depth": bid_depth,
            "ask_depth": ask_depth,
            "tradeable": spread < 0.03 and bid_depth > 50,
        }
    
    # ═══════════════════════════════════════════════════════════
    # TRADING METHODS (Require auth)
    # ═══════════════════════════════════════════════════════════
    
    def buy_market(self, token_id, amount_usd):
        """Place market buy order"""
        if not self.authenticated:
            print("❌ Authentication required for trading")
            return None
        
        order = MarketOrderArgs(
            token_id=token_id,
            amount=float(amount_usd),
            side=BUY
        )
        
        signed = self.client.create_market_order(order)
        resp = self.client.post_order(signed, OrderType.FOK)
        
        self._record_trade({
            "type": "BUY",
            "token_id": token_id,
            "amount_usd": amount_usd,
            "response": resp,
            "timestamp": datetime.now().isoformat()
        })
        
        return resp
    
    def buy_limit(self, token_id, price, size):
        """Place limit buy order"""
        if not self.authenticated:
            print("❌ Authentication required for trading")
            return None
        
        order = OrderArgs(
            token_id=token_id,
            price=float(price),
            size=float(size),
            side=BUY
        )
        
        signed = self.client.create_order(order)
        resp = self.client.post_order(signed, OrderType.GTC)
        
        self._record_trade({
            "type": "LIMIT_BUY",
            "token_id": token_id,
            "price": price,
            "size": size,
            "response": resp,
            "timestamp": datetime.now().isoformat()
        })
        
        return resp
    
    def sell_market(self, token_id, size):
        """Place market sell order"""
        if not self.authenticated:
            print("❌ Authentication required for trading")
            return None
        
        order = MarketOrderArgs(
            token_id=token_id,
            amount=float(size),
            side=SELL
        )
        
        signed = self.client.create_market_order(order)
        resp = self.client.post_order(signed, OrderType.FOK)
        
        self._record_trade({
            "type": "SELL",
            "token_id": token_id,
            "size": size,
            "response": resp,
            "timestamp": datetime.now().isoformat()
        })
        
        return resp
    
    def get_open_orders(self):
        """Get all open orders"""
        if not self.authenticated:
            return []
        return self.client.get_orders(OpenOrderParams())
    
    def cancel_order(self, order_id):
        """Cancel specific order"""
        if not self.authenticated:
            return None
        return self.client.cancel(order_id)
    
    def cancel_all_orders(self):
        """Cancel all open orders"""
        if not self.authenticated:
            return None
        return self.client.cancel_all()
    
    def _record_trade(self, trade):
        """Record trade to history"""
        history = []
        if CONFIG["history_file"].exists():
            with open(CONFIG["history_file"]) as f:
                history = json.load(f)
        
        history.append(trade)
        
        with open(CONFIG["history_file"], "w") as f:
            json.dump(history, f, indent=2)

# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

def main():
    args = sys.argv[1:]
    cmd = args[0] if args else "help"
    
    print("""
╔═══════════════════════════════════════════════════════════════╗
║            B0B Polymarket Trader (Python)                     ║
║         Fierce Pragmatic Trade Execution                      ║
╚═══════════════════════════════════════════════════════════════╝
""")
    
    if not HAS_CLOB:
        print("❌ Install py-clob-client first:")
        print("   pip install py-clob-client")
        return
    
    trader = B0BTrader()
    
    if cmd == "status":
        trader.connect()
        status = trader.get_status()
        print(f"🟢 API Status: {status['ok']}")
        print(f"⏰ Server Time: {status['time']}")
    
    elif cmd == "markets":
        trader.connect()
        markets = trader.get_markets()
        print("📊 Markets:\n")
        for m in markets.get("data", [])[:10]:
            print(f"   {m.get('question', 'Unknown')[:60]}...")
            print(f"   Token: {m.get('tokens', [{}])[0].get('token_id', 'N/A')[:20]}...\n")
    
    elif cmd == "analyze":
        if len(args) < 2:
            print("Usage: python trader.py analyze <token-id>")
            return
        
        trader.connect()
        analysis = trader.analyze_market(args[1])
        
        print(f"🔍 Analysis for {args[1][:20]}...\n")
        print(f"   Midpoint: {analysis['midpoint']*100:.2f}¢")
        print(f"   Spread: {analysis['spread']*100:.2f}¢ ({analysis['spread_pct']:.2f}%)")
        print(f"   Bid Depth: ${analysis['bid_depth']:.0f}")
        print(f"   Ask Depth: ${analysis['ask_depth']:.0f}")
        print(f"   Tradeable: {'✅ Yes' if analysis['tradeable'] else '❌ No'}")
    
    elif cmd == "buy":
        if len(args) < 3:
            print("Usage: python trader.py buy <token-id> <amount-usd>")
            return
        
        trader.connect(auth=True)
        if trader.authenticated:
            resp = trader.buy_market(args[1], float(args[2]))
            print(f"📈 Buy order response: {resp}")
        else:
            print("❌ Set up config.json with private_key first")
    
    elif cmd == "sell":
        if len(args) < 3:
            print("Usage: python trader.py sell <token-id> <size>")
            return
        
        trader.connect(auth=True)
        if trader.authenticated:
            resp = trader.sell_market(args[1], float(args[2]))
            print(f"📉 Sell order response: {resp}")
    
    elif cmd == "watch":
        if len(args) < 2:
            print("Usage: python trader.py watch <token-id>")
            return
        
        trader.connect()
        token_id = args[1]
        print(f"👁️  Watching {token_id[:20]}... (Ctrl+C to stop)\n")
        
        last_price = None
        while True:
            try:
                mid = float(trader.get_midpoint(token_id).get("mid", 0))
                change = ((mid - last_price) / last_price * 100) if last_price else 0
                arrow = "📈" if change > 0 else "📉" if change < 0 else "➡️"
                print(f"{arrow} {mid*100:.2f}¢ ({'+' if change > 0 else ''}{change:.2f}%)")
                last_price = mid
                time.sleep(5)
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(5)
    
    else:
        print("""
Commands:
    python trader.py status              - Check API connection
    python trader.py markets             - List markets
    python trader.py analyze <token>     - Analyze market
    python trader.py watch <token>       - Watch price
    python trader.py buy <token> <$>     - Market buy (requires auth)
    python trader.py sell <token> <size> - Market sell (requires auth)

Setup for trading:
    1. Create config.json with:
       {
         "private_key": "your-private-key",
         "funder_address": "your-wallet-address",
         "signature_type": 0
       }
    2. Ensure token allowances are set (see py-clob-client docs)
        """)

if __name__ == "__main__":
    main()
