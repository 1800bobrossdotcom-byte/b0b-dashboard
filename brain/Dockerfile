FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve node-fetch conflict
RUN npm install --omit=dev --legacy-peer-deps

# Copy source
COPY . .

# Create data directory (data files are already copied with COPY . .)
RUN mkdir -p data

EXPOSE 3001

CMD ["node", "brain-server.js"]
