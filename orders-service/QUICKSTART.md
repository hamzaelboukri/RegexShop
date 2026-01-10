# 🚀 Quick Start Guide - Orders Service

This guide will get your Orders Service up and running in minutes.

## Option 1: Docker (Recommended)

### From Project Root

```bash
# Start all services including orders-service
docker-compose up -d

# Or start only orders-service with its dependencies
docker-compose up -d postgres-orders kafka zookeeper orders-service

# Check logs
docker-compose logs -f orders-service

# Stop services
docker-compose down
```

### Access Points
- **API**: http://localhost:3004
- **Swagger Docs**: http://localhost:3004/api/docs
- **Health Check**: http://localhost:3004/health
- **Database**: localhost:5436

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15
- Running on port 5436

### Quick Setup

**Windows (PowerShell)**:
```powershell
.\setup.ps1
```

**Linux/Mac**:
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env with your configuration

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations
npx prisma migrate dev --name init

# 5. Start service
npm run start:dev
```

## 🧪 Test the Service

### 1. Check Health
```bash
curl http://localhost:3004/health
```

### 2. Get JWT Token
First, login through the auth-service to get a JWT token:

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@youshop.com",
    "password": "admin123"
  }'
```

### 3. Create an Order
```bash
curl -X POST http://localhost:3004/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "prod-123",
        "sku": "SKU-001",
        "productName": "Test Product",
        "quantity": 2,
        "unitPrice": 29.99
      }
    ],
    "shippingAddress": {
      "fullName": "John Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "taxRate": 0.20,
    "shippingCost": 5.99
  }'
```

### 4. Get Your Orders
```bash
curl http://localhost:3004/orders/my-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. View Swagger Documentation
Open your browser and visit: http://localhost:3004/api/docs

## 📊 Database Management

### View Database with Prisma Studio
```bash
npx prisma studio
```
Opens at: http://localhost:5555

### Run Migrations
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Reset Database (Dev only)
```bash
npx prisma migrate reset
```

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
docker ps | grep postgres-orders

# Or locally
netstat -an | findstr 5436  # Windows
lsof -i :5436              # Linux/Mac
```

### Port Already in Use
```bash
# Change PORT in .env file
PORT=3005

# Or stop the conflicting service
docker stop orders-service
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Migration Issues
```bash
# Reset and reapply migrations (Dev only!)
npx prisma migrate reset
npx prisma migrate dev --name init
```

## 📝 Common Commands

```bash
# Development
npm run start:dev         # Start with hot reload
npm run build            # Build for production
npm run start:prod       # Start production build

# Testing
npm run test             # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Test coverage

# Linting
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Prisma
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create & apply migration
npx prisma generate      # Generate Prisma client
```

## 🔗 Integration with Other Services

### Required Services
- **Auth Service** (port 3001): For JWT token validation
- **Catalog Service** (port 3002): For product information
- **Inventory Service** (port 3003): For stock management

### Start All Services
```bash
# From project root
docker-compose up -d
```

## 📚 Next Steps

1. ✅ Service is running
2. 📖 Read the [full README](./README_ORDERS.md)
3. 🔍 Explore the [API documentation](http://localhost:3004/api/docs)
4. 🧪 Try the example requests above
5. 🏗️ Integrate with your frontend application

## 🆘 Need Help?

- Check the logs: `docker-compose logs -f orders-service`
- View health status: http://localhost:3004/health
- Review Swagger docs: http://localhost:3004/api/docs
- Contact the development team

---

**Tip**: Use the Swagger UI at http://localhost:3004/api/docs to test all endpoints interactively!
