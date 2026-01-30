FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy crawler files
COPY *.js ./

# Copy brain intelligence agents (needed for L0RE logic)
COPY ../brain/agents/ ./brain/agents/
COPY ../brain/l0re-intelligence.js ./brain/

# Create data directory
RUN mkdir -p data brain/data brain/data/learnings

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Run the daemon
CMD ["node", "swarm-daemon.js"]
