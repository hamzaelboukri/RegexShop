# Quick Start Guide - Inventory Service

## Prerequisites
- Node.js 20+
- PostgreSQL running
- npm installed

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd inventory-service
npm install --legacy-peer-deps
```

### 2. Configure Environment
```bash
# Create .env file
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/inventory_db?schema=public"
JWT_SECRET="youshop-secret-key"
PORT=3002
KAFKA_BROKER="kafka:9092"
```

### 3. Initialize Database
```bash
# Generate Prisma Client
npx prisma generate

# Create database and run migrations
npx prisma migrate dev --name init

# Optional: Seed with sample data
# Create a seed script if needed
```

### 4. Start the Service
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 5. Test the API
Visit: http://localhost:3002/api/docs

## Sample API Calls

### Get All Inventory Items
```bash
curl http://localhost:3002/inventory
```

### Create Inventory Item (requires Admin JWT token)
```bash
curl -X POST http://localhost:3002/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "LAPTOP-DELL-XPS13",
    "productId": "prod-123",
    "name": "Dell XPS 13 Laptop",
    "total": 50,
    "lowStockThreshold": 5
  }'
```

### Reserve Stock for Order
```bash
curl -X POST http://localhost:3002/inventory/{id}/reserve \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 1,
    "orderId": "order-456"
  }'
```

## Getting a JWT Token

Since this is a microservice, you'll need to get a JWT token from the auth-service first:

```bash
# Register a new user (from auth-service)
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youshop.com",
    "password": "securePassword123",
    "name": "Admin User",
    "role": "ADMIN"
  }'

# Login to get token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youshop.com",
    "password": "securePassword123"
  }'

# Use the returned access_token in subsequent requests
```

## Docker Setup (Alternative)

### Using Docker Compose (from project root)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f inventory-service

# Stop services
docker-compose down
```

### Build Single Container
```bash
cd inventory-service

# Build image
docker build -t youshop-inventory .

# Run container
docker run -p 3002:3002 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/inventory_db" \
  -e JWT_SECRET="youshop-secret-key" \
  youshop-inventory
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3002 (Windows)
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Change port in .env
PORT=3003
```

### Database Connection Failed
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Create database manually: `createdb inventory_db`

### Prisma Generate Errors
```bash
# Clear generated files and regenerate
rm -rf generated
npx prisma generate
```

## Development Tips

### Watch Mode
The service auto-reloads on file changes in dev mode:
```bash
npm run start:dev
```

### Database Changes
After modifying schema.prisma:
```bash
npx prisma migrate dev --name describe_your_changes
npx prisma generate
```

### View Database
```bash
# Open Prisma Studio (GUI for database)
npx prisma studio
```

### Testing
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Integration with Other Services

### Catalog Service
The Inventory Service works with product IDs from the Catalog Service:
- Store `productId` reference in InventoryItem
- One product can have multiple inventory items (variants by SKU)

### Orders Service
Flow for order creation:
1. Order Service creates order
2. Order Service calls Inventory Service to reserve stock
3. On payment success → Confirm order (removes from total)
4. On payment failure/cancel → Release reserved stock

### API Gateway (Optional)
Route requests through API Gateway:
- Gateway: `/api/inventory/*` → Inventory Service: `/inventory/*`
- Gateway handles authentication
- Inventory Service validates JWT

## Next Steps

1. ✅ Service is running
2. Test endpoints with Swagger UI
3. Integrate with Orders Service
4. Add Kafka event handlers (bonus)
5. Deploy to production

---

**Support**: Check README.md and SETUP_SUMMARY.md for details
**API Docs**: http://localhost:3002/api/docs
