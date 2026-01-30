FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve node-fetch conflict
RUN npm install --omit=dev --legacy-peer-deps

# Copy source
COPY . .

# Create data directory and ensure it persists
RUN mkdir -p data

# Copy data files if they exist (for initial state)
COPY data/*.json data/ 2>/dev/null || true

EXPOSE 3001

CMD ["node", "brain-server.js"]
