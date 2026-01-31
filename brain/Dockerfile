FROM node:20-alpine

WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json ./

# Install dependencies (cached if package.json unchanged)
RUN npm install --omit=dev --legacy-peer-deps

# Copy source files EXCEPT data (for caching)
COPY *.js ./
COPY agents/ ./agents/
COPY ai/ ./ai/
COPY config/ ./config/
COPY learnings/ ./learnings/
COPY l0re/ ./l0re/
COPY ollama/ ./ollama/
COPY rss/ ./rss/
COPY security/ ./security/
COPY senses/ ./senses/
COPY visuals/ ./visuals/

# ═══════════════════════════════════════════════════════════════════════════════
# DATA LAYER — Copy data LAST to prevent stale cache
# Any change to data/** files will invalidate this layer
# ═══════════════════════════════════════════════════════════════════════════════
COPY data/ ./data/

# Verify TURB0B00ST trading data is present and has trades
RUN echo "═══════════════════════════════════════════════════════" && \
    echo "  TURB0B00ST DATA VERIFICATION" && \
    echo "═══════════════════════════════════════════════════════" && \
    cat data/turb0b00st-state.json | head -30 && \
    echo "" && \
    echo "Trade count check:" && \
    grep -c '"timestamp":' data/turb0b00st-state.json || echo "0" && \
    echo "═══════════════════════════════════════════════════════"

EXPOSE 3001

CMD ["node", "brain-server.js"]
