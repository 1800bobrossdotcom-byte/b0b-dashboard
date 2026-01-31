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

# Copy data LAST to prevent cache issues
# This layer will rebuild every time data changes
COPY data/ ./data/

# Verify data files are present
RUN echo "=== TURB0B00ST DATA VERIFICATION ===" && \
    cat data/turb0b00st-state.json | head -20 && \
    echo "=== END VERIFICATION ==="

EXPOSE 3001

CMD ["node", "brain-server.js"]
