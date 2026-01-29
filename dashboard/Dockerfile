# B0B Dashboard - Self-Hosted Fallback
# ═══════════════════════════════════════════════════════════════
# Use when Railway/Vercel are down
# 
# Build: docker build -t b0b-dashboard -f dashboard/Dockerfile .
# Run:   docker run -p 3000:3000 -e NEXT_PUBLIC_BRAIN_URL=https://b0b-brain-production.up.railway.app b0b-dashboard
#
# @author r0ss 🔧

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
