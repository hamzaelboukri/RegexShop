# ---- BUILDER ----
FROM node:20-slim AS builder

# Install OpenSSL, Python and build tools for Prisma and bcrypt
RUN apt-get update -y && apt-get install -y openssl python3 make g++

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

# Set a dummy DATABASE_URL for Prisma client generation
# (only used to generate types, not to connect to actual DB)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma Client
RUN npx prisma generate

# Verify Prisma Client was generated
RUN ls -la node_modules/.prisma/client || echo "Prisma client not found"

# Build NestJS application
RUN npm run build

# ---- PRODUCTION ----
FROM node:20-slim

# Install OpenSSL, Python and build tools for Prisma and bcrypt
RUN apt-get update -y && apt-get install -y openssl python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy prisma schema for migrations
COPY prisma ./prisma

# Generate Prisma Client for production
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/src/main"]

