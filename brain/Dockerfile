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

EXPOSE 3001

CMD ["node", "brain-server.js"]
