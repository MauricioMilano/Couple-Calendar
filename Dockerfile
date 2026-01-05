# Multi-stage Dockerfile for building the Vite + Node (Express) app
# Builder stage: install deps and create the client build
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies based on lockfile for reproducible installs
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy project files and run the Vite build
COPY . .
RUN npm run build

# Production stage: copy only what's needed to run the server
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy node_modules and built assets from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Launch the server (server reads PORT and SESSION_SECRET from env)
CMD ["node", "server.js"]
