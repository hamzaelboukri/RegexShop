# ---- BUILDER ----
FROM node:20-slim AS builder

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code and prisma schema
COPY src ./src
COPY prisma ./prisma
COPY prisma.config.ts ./

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
RUN npm install --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/generated ./dist/generated

# Copy prisma schema (for reference)
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Set NODE_PATH so modules can be found
ENV NODE_PATH=/app

# Start command
CMD ["node", "dist/src/main"]
