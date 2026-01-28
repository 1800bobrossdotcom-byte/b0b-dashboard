FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only required dependencies (skip optional native modules)
RUN npm install --omit=dev --omit=optional

# Copy source
COPY . .

# Create data directory
RUN mkdir -p data

EXPOSE 3001

CMD ["node", "brain-server.js"]
