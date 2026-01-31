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
# CACHE BUSTER — Forces rebuild when data changes
# Update this timestamp to force Railway to rebuild data layer
# ═══════════════════════════════════════════════════════════════════════════════
ARG CACHE_BUST=2026-01-31T15:15:00Z
RUN echo "Cache bust: ${CACHE_BUST}"

# Copy data LAST to prevent cache issues
# This layer will rebuild every time data changes
COPY data/ ./data/

# Verify TURB0B00ST trading data is present
RUN echo "═══════════════════════════════════════════════════════" && \
    echo "  TURB0B00ST DATA VERIFICATION" && \
    echo "═══════════════════════════════════════════════════════" && \
    echo "Mode:" && grep -o '"mode": "[^"]*"' data/turb0b00st-state.json && \
    echo "Trade count:" && grep -c '"timestamp":' data/turb0b00st-state.json && \
    echo "First trade:" && grep -m1 '"timestamp":' data/turb0b00st-state.json && \
    echo "═══════════════════════════════════════════════════════"

EXPOSE 3001

CMD ["node", "brain-server.js"]
