FROM node:20-alpine

WORKDIR /app

# Copy package files (context is already brain/)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy source (context is brain/)
COPY . .

# Ensure data directories exist
RUN mkdir -p data/learnings data/library/index

# Force cache invalidation for data files - ensures fresh data on every build
ARG CACHE_BUST=1
RUN echo "Cache bust: $CACHE_BUST - $(date)"

# Verify critical data files exist
RUN ls -la data/ | head -20

EXPOSE 3001

CMD ["node", "brain-server.js"]
