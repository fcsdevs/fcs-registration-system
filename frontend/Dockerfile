# Build stage
FROM node:20-slim AS builder

# Set build-time environment variables (NEXT_PUBLIC_ variables must be available during build)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignoring scripts that might depend on local dev setup)
RUN npm ci

# Copy application code
COPY . .

# Build Next.js
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    dumb-init \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PM2
RUN npm install -g pm2

# Copy built app and required files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./ 
COPY --from=builder /app/node_modules ./node_modules
COPY ecosystem.config.cjs ./

# Set ownership to node user
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application with PM2 runtime
CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]
