FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to resolve node-fetch conflict
RUN npm install --omit=dev --legacy-peer-deps

# Copy brain source
COPY . .

# Copy crawlers directory from parent
COPY ../crawlers ../crawlers

# Create data directories
RUN mkdir -p data/learnings data/library/index

EXPOSE 3001

CMD ["node", "brain-server.js"]
