#!/bin/bash
# Clone all research repos for B0B team

REPO_DIR="./repos"
mkdir -p $REPO_DIR
cd $REPO_DIR

echo "📚 Cloning B0B Research Library..."

# Priority Trading Repos
echo "🏦 Trading & Markets..."
git clone --depth 1 https://github.com/Polymarket/agents.git polymarket-agents 2>/dev/null || echo "  ↳ polymarket-agents exists"
git clone --depth 1 https://github.com/berlinbra/polymarket-mcp-server.git polymarket-mcp 2>/dev/null || echo "  ↳ polymarket-mcp exists"
git clone --depth 1 https://github.com/The-Swarm-Corporation/AutoHedge.git autohedge 2>/dev/null || echo "  ↳ autohedge exists"
git clone --depth 1 https://github.com/kenzic/maverick-mcp.git maverick-mcp 2>/dev/null || echo "  ↳ maverick-mcp exists"

# Reference only (large repos)
echo "📊 Reference Frameworks..."
git clone --depth 1 https://github.com/freqtrade/freqtrade.git freqtrade 2>/dev/null || echo "  ↳ freqtrade exists"
git clone --depth 1 https://github.com/hummingbot/hummingbot.git hummingbot 2>/dev/null || echo "  ↳ hummingbot exists"

# AI Agents
echo "🤖 AI Agent Frameworks..."
git clone --depth 1 https://github.com/anthropics/anthropic-quickstarts.git anthropic-quickstarts 2>/dev/null || echo "  ↳ anthropic-quickstarts exists"

# DeFi/Crypto
echo "💎 DeFi Protocols..."
git clone --depth 1 https://github.com/Uniswap/v3-core.git uniswap-v3 2>/dev/null || echo "  ↳ uniswap-v3 exists"

echo ""
echo "✅ Research library ready!"
echo "📁 Location: $REPO_DIR"
ls -la
