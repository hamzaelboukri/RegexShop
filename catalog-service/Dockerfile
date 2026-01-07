# ---- BUILDER ----
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code and prisma schema
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS application
RUN npm run build

# ---- PRODUCTION ----
FROM node:20-slim

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema and config for migrations
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client for production
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/src/main"]
