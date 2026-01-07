# Inventory Service - YouShop

## Overview

The Inventory Service manages stock operations for the YouShop e-commerce platform. It handles:
- Stock management by SKU (Stock Keeping Unit)
- Stock reservation for orders
- Stock release when orders are cancelled
- Low stock alerts
- Stock movement history tracking

## Features

### Core Functionality
- ✅ CRUD operations for inventory items
- ✅ Stock reservation and release mechanisms
- ✅ Automatic stock movement tracking
- ✅ Low stock detection and alerts
- ✅ Role-based access control (Admin/Client)
- ✅ JWT authentication
- ✅ Comprehensive API documentation (Swagger)

### Business Logic
- **Available Stock**: Quantity available for new orders
- **Reserved Stock**: Quantity reserved in pending orders
- **Total Stock**: Physical stock (available + reserved)
- **Stock Movements**: Complete audit trail of all stock changes

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Messaging**: Kafka (for microservices communication)

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Running the Service

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### API Documentation

Once the service is running, visit:
- Swagger UI: http://localhost:3002/api/docs

## API Endpoints

### Inventory Management

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/inventory` | ✅ | ADMIN | Create new inventory item |
| GET | `/inventory` | ❌ | - | Get all inventory items (paginated) |
| GET | `/inventory/low-stock` | ✅ | ADMIN | Get low stock items |
| GET | `/inventory/sku/:sku` | ❌ | - | Get item by SKU |
| GET | `/inventory/product/:productId` | ❌ | - | Get items by product ID |
| GET | `/inventory/:id` | ❌ | - | Get item by ID |
| PATCH | `/inventory/:id` | ✅ | ADMIN | Update item metadata |
| DELETE | `/inventory/:id` | ✅ | ADMIN | Delete item |

### Stock Operations

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/inventory/:id/stock` | ✅ | ADMIN | Add/subtract stock |
| POST | `/inventory/:id/reserve` | ✅ | - | Reserve stock for order |
| POST | `/inventory/:id/release` | ✅ | - | Release reserved stock |
| GET | `/inventory/:id/movements` | ✅ | ADMIN | Get stock movement history |
| GET | `/inventory/movements/order/:orderId` | ✅ | ADMIN | Get movements by order |

## Database Schema

### InventoryItem
```prisma
model InventoryItem {
  id                String   @id @default(uuid())
  sku               String   @unique
  productId         String
  name              String
  available         Int      @default(0)
  reserved          Int      @default(0)
  total             Int      @default(0)
  lowStockThreshold Int      @default(10)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### StockMovement
```prisma
model StockMovement {
  id              String       @id @default(uuid())
  inventoryItemId String
  type            MovementType // IN, OUT, RESERVE, RELEASE
  quantity        Int
  reason          String?
  orderId         String?
  performedBy     String?
  createdAt       DateTime     @default(now())
}
```

## Usage Examples

### Create Inventory Item (Admin)
```bash
POST /inventory
Authorization: Bearer <token>

{
  "sku": "TSHIRT-RED-M",
  "productId": "product-123",
  "name": "Red T-Shirt Medium",
  "total": 100,
  "lowStockThreshold": 10
}
```

### Reserve Stock (Order System)
```bash
POST /inventory/:id/reserve
Authorization: Bearer <token>

{
  "quantity": 2,
  "orderId": "order-456",
  "performedBy": "user-789"
}
```

### Release Stock (Order Cancelled)
```bash
POST /inventory/:id/release
Authorization: Bearer <token>

{
  "quantity": 2,
  "orderId": "order-456",
  "reason": "Order cancelled by customer"
}
```

### Update Stock (Admin Restocking)
```bash
POST /inventory/:id/stock
Authorization: Bearer <token>

{
  "quantity": 50,
  "reason": "Received new shipment",
  "performedBy": "admin-123"
}
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
JWT_SECRET="your-secret-key"
PORT=3002
KAFKA_BROKER="kafka:9092"
```

## Docker Deployment

```bash
# Build image
docker build -t inventory-service .

# Run container
docker run -p 3002:3002 --env-file .env inventory-service
```

## Microservices Integration

The Inventory Service can be integrated with other services via:
1. **REST API**: Direct HTTP calls for synchronous operations
2. **Kafka Events**: Asynchronous communication for order events

### Event Handling
- Listen to `order.created` → Reserve stock
- Listen to `order.cancelled` → Release stock
- Emit `inventory.low-stock` → Alert admin

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Guidelines

### Stock Operations Rules
1. **Total = Available + Reserved** (always maintained)
2. Cannot reduce available stock below reserved quantity
3. All stock changes must be logged in StockMovement
4. Low stock threshold triggers alerts

### Security
- Admin-only endpoints: Creating items, updating stock, viewing movements
- Authenticated endpoints: Reserving/releasing stock
- Public endpoints: Viewing inventory items

## Project Structure

```
inventory-service/
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── auth/                # Authentication module
│   │   ├── decorators/      # Custom decorators
│   │   ├── enums/           # Role enums
│   │   ├── guards/          # JWT and roles guards
│   │   └── strategies/      # JWT strategy
│   ├── dto/                 # Data Transfer Objects
│   ├── inventory/           # Inventory module
│   │   ├── inventory.controller.ts
│   │   ├── inventory.service.ts
│   │   └── inventory.module.ts
│   ├── prisma/              # Prisma module
│   ├── app.module.ts        # Root module
│   └── main.ts              # Bootstrap
├── .env.example             # Environment template
├── Dockerfile               # Docker configuration
└── package.json             # Dependencies
```

## Contributing

1. Follow NestJS best practices
2. Use TypeScript strict mode
3. Add proper validation with class-validator
4. Document APIs with Swagger decorators
5. Write tests for business logic

## License

Proprietary - YouShop Platform
