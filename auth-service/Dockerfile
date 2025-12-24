# ---- BASE ----
FROM node:20-slim

# Install OpenSSL and other dependencies for Prisma
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Installer dependencies
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# Exposer le port
EXPOSE 3000

# Commande de lancement
CMD ["npm", "run", "start:prod"]
