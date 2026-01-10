# 🎯 Orders Service - Complete Startup Instructions

Welcome! Your Orders Service is fully implemented and ready to run. Follow these steps to get started.

## ✅ What You Already Have

All code has been created and configured:
- ✅ Complete Prisma database schema
- ✅ All DTOs and validation
- ✅ Authentication and authorization (JWT + Roles)
- ✅ Full CRUD order management service
- ✅ REST API with 10 endpoints
- ✅ Docker configuration
- ✅ Health check endpoint
- ✅ Swagger documentation setup

## 🚀 Quick Start (Choose One Method)

### Option A: Docker (Easiest - Recommended)

```powershell
# From project root directory
cd c:\Users\Youcode\Desktop\projet\regex_shop

# Start all services
docker-compose up -d

# Or start only orders-service
docker-compose up -d postgres-orders orders-service

# Check logs
docker-compose logs -f orders-service

# Test the service
curl http://localhost:3004/health
```

**Access**:
- API: http://localhost:3004
- Swagger: http://localhost:3004/api/docs
- Database: localhost:5436

### Option B: Local Development

```powershell
# Navigate to orders-service
cd c:\Users\Youcode\Desktop\projet\regex_shop\orders-service

# Run setup script (installs dependencies & generates Prisma client)
.\setup.ps1

# Start PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running on port 5436

# Update .env if needed
# Edit .env file with correct DATABASE_URL

# Run migrations
npm run prisma:migrate

# Start the service
npm run start:dev
```

## 📋 Step-by-Step Setup (First Time)

### 1. Install Dependencies

```powershell
cd c:\Users\Youcode\Desktop\projet\regex_shop\orders-service
npm install
```

### 2. Generate Prisma Client

```powershell
npx prisma generate
# or
npm run prisma:generate
```

### 3. Check Environment Variables

The `.env.example` file is already created. You need to copy or create `.env`:

```powershell
# Copy example
Copy-Item .env.example .env

# Or create manually with these values:
```

**.env file contents**:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5436/orders"
JWT_SECRET="youshop-secret-key"
KAFKA_BROKER="localhost:9092"
ENABLE_KAFKA="false"
PORT=3004
NODE_ENV="development"
AUTH_SERVICE_URL="http://localhost:3001"
CATALOG_SERVICE_URL="http://localhost:3002"
INVENTORY_SERVICE_URL="http://localhost:3003"
```

### 4. Start PostgreSQL Database

**Option 1 - Docker (Recommended)**:
```powershell
# From project root
docker-compose up -d postgres-orders
```

**Option 2 - Local PostgreSQL**:
- Ensure PostgreSQL is running on port 5436
- Create database: `CREATE DATABASE orders;`

### 5. Run Database Migrations

```powershell
npx prisma migrate dev --name init
# or
npm run prisma:migrate
```

This creates the `orders` and `order_items` tables with all necessary indexes.

### 6. Start the Service

```powershell
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

**You should see**:
```
🚀 Orders Service is running on: http://localhost:3004
📚 API Documentation: http://localhost:3004/api/docs
```

## 🧪 Test the Service

### 1. Health Check

```powershell
curl http://localhost:3004/health
```

**Expected response**:
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T...",
  "service": "orders-service",
  "database": "connected"
}
```

### 2. View API Documentation

Open your browser:
```
http://localhost:3004/api/docs
```

You'll see the interactive Swagger UI with all endpoints!

### 3. Get a JWT Token (From Auth Service)

First, you need to get a token from the auth-service:

```powershell
# Make sure auth-service is running on port 3001
curl -X POST http://localhost:3001/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@youshop.com\",\"password\":\"admin123\"}'
```

Save the returned `access_token`.

### 4. Create Your First Order

```powershell
# Replace YOUR_TOKEN with the JWT token from step 3
curl -X POST http://localhost:3004/orders `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"items\":[{\"productId\":\"prod-123\",\"sku\":\"SKU-001\",\"productName\":\"Test Product\",\"quantity\":2,\"unitPrice\":29.99}],\"shippingAddress\":{\"fullName\":\"John Doe\",\"addressLine1\":\"123 Main St\",\"city\":\"New York\",\"state\":\"NY\",\"postalCode\":\"10001\",\"country\":\"USA\"}}'
```

### 5. Get Your Orders

```powershell
curl http://localhost:3004/orders/my-orders `
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Database Management

### View Database with Prisma Studio

```powershell
npx prisma studio
# or
npm run prisma:studio
```

Opens at: http://localhost:5555

### Useful Prisma Commands

```powershell
# Generate client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Reset database (DEV ONLY!)
npm run prisma:reset

# View migrations
npx prisma migrate status
```

## 🐛 Troubleshooting

### "Cannot connect to database"

**Check 1: Is PostgreSQL running?**
```powershell
docker ps | Select-String postgres-orders
# or for local:
netstat -an | Select-String 5436
```

**Check 2: Is DATABASE_URL correct?**
```powershell
# View your .env
cat .env
```

**Check 3: Can you connect manually?**
```powershell
# Test connection with psql or any PostgreSQL client
psql -h localhost -p 5436 -U postgres -d orders
```

### "Prisma Client could not be generated"

```powershell
# Clean and regenerate
Remove-Item -Recurse -Force .\generated
npx prisma generate
```

### "Port 3004 already in use"

**Option 1: Change port in .env**
```env
PORT=3005
```

**Option 2: Stop conflicting process**
```powershell
# Find process on port 3004
netstat -ano | Select-String ":3004"

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### "Module not found" errors

```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force .\node_modules
Remove-Item package-lock.json
npm install
```

### "JWT authentication failed"

1. **Check JWT_SECRET matches between services**
   - Auth service and orders service must use the same secret
   - Check `.env` file in both services

2. **Token expired**
   - Get a new token from auth service

3. **Token format**
   - Use: `Authorization: Bearer YOUR_TOKEN`
   - NOT: `Authorization: YOUR_TOKEN`

## 📚 Documentation

- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Full README**: [README_ORDERS.md](./README_ORDERS.md)
- **API Docs**: [API_DOCS.md](./API_DOCS.md)
- **Implementation**: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
- **Swagger UI**: http://localhost:3004/api/docs (when running)

## 🔗 Integration with Other Services

### Required Services

For full functionality, you need these services running:

1. **Auth Service** (port 3001)
   - Provides JWT tokens
   - User authentication

2. **Catalog Service** (port 3002)
   - Product information
   - Referenced by product IDs

3. **Inventory Service** (port 3003)
   - Stock management
   - Future integration for reservations

### Start All Services

```powershell
# From project root
cd c:\Users\Youcode\Desktop\projet\regex_shop
docker-compose up -d
```

## 📝 Available NPM Scripts

```powershell
# Development
npm run start:dev          # Start with hot reload
npm run build             # Build for production
npm run start:prod        # Start production build

# Database (Prisma)
npm run prisma:generate   # Generate Prisma Client
npm run prisma:migrate    # Run migrations
npm run prisma:studio     # Open database GUI
npm run prisma:reset      # Reset database (DEV ONLY!)

# Code Quality
npm run lint              # Run ESLint
npm run format            # Format with Prettier

# Testing
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # Coverage report
npm run test:e2e          # End-to-end tests
```

## ✅ Verification Checklist

Before considering setup complete, verify:

- [ ] Dependencies installed (`node_modules` exists)
- [ ] Prisma client generated (`generated/prisma` exists)
- [ ] `.env` file created with correct values
- [ ] PostgreSQL running (port 5436)
- [ ] Migrations applied (tables created)
- [ ] Service starts without errors
- [ ] Health check returns "ok"
- [ ] Swagger UI accessible
- [ ] Can create an order (with valid JWT)
- [ ] Can retrieve orders

## 🎉 Success!

If you've reached here and all checks pass, congratulations! Your Orders Service is fully operational.

### Next Steps:

1. ✅ **Test the API** using Swagger UI
2. ✅ **Create sample orders** for testing
3. ✅ **Integrate with frontend** application
4. ✅ **Set up monitoring** and logging
5. ✅ **Deploy to production** when ready

## 🆘 Need Help?

### Common Commands Reference

```powershell
# Service Management
docker-compose up -d orders-service          # Start service
docker-compose logs -f orders-service        # View logs
docker-compose restart orders-service        # Restart service
docker-compose stop orders-service           # Stop service
docker-compose down                          # Stop all services

# Database Access
npx prisma studio                            # GUI database viewer
docker exec -it postgres-orders psql -U postgres -d orders  # CLI access

# Service Status
curl http://localhost:3004/health            # Health check
curl http://localhost:3004/api/docs          # API docs
```

### Getting Errors?

1. **Read the error message** carefully
2. **Check the logs**: `docker-compose logs -f orders-service`
3. **Verify prerequisites**: Node.js, PostgreSQL, Docker
4. **Review troubleshooting** section above
5. **Check documentation** files

### Contact

For additional support, refer to:
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What was built
- [API_DOCS.md](./API_DOCS.md) - API reference
- [README_ORDERS.md](./README_ORDERS.md) - Full documentation

---

**Remember**: This is a development setup. For production:
- Use environment-specific `.env` files
- Set up proper secrets management
- Configure SSL/TLS
- Set up monitoring and alerting
- Implement rate limiting
- Configure backups
- Use production-grade database settings

**Happy coding! 🚀**
