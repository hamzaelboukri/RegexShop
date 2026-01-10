# Orders Service - YouShop

## 📋 Description

The Orders Service is a core component of the YouShop e-commerce platform, responsible for managing customer orders, order lifecycle, payment tracking, and integration with inventory management.

## 🚀 Features

- **Order Creation**: Create orders with multiple items, calculate totals, taxes, and shipping
- **Order Lifecycle Management**: Track orders through stages (Pending → Confirmed → Processing → Shipped → Delivered)
- **Payment Tracking**: Monitor payment status (Unpaid, Paid, Failed, Refunded)
- **Order Cancellation**: Allow customers to cancel orders in eligible states
- **User Authorization**: JWT-based authentication with role-based access control (Admin/Client)
- **Order History**: Retrieve user order history with pagination
- **Statistics**: Admin dashboard statistics for orders and revenue
- **Health Checks**: Monitor service and database health

## 📦 Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma 7
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Message Broker**: Kafka (optional)

## 🏗️ Architecture

### Database Schema

#### Order Model
- Order tracking with unique order numbers
- User reference (from auth-service)
- Status tracking (OrderStatus enum)
- Payment tracking (PaymentStatus enum)
- Financial calculations (subtotal, tax, shipping, total)
- Shipping and billing addresses (JSON)
- Timestamps for creation, updates, cancellation, completion

#### OrderItem Model
- Product snapshot at order time
- Quantity and pricing
- SKU tracking for inventory integration

### API Endpoints

#### Public/Client Endpoints
- `POST /orders` - Create new order (CLIENT, ADMIN)
- `GET /orders/my-orders` - Get user's orders (CLIENT, ADMIN)
- `GET /orders/:id` - Get specific order (CLIENT, ADMIN)
- `GET /orders/number/:orderNumber` - Get order by number (CLIENT, ADMIN)
- `POST /orders/:id/cancel` - Cancel order (CLIENT, ADMIN)

#### Admin Endpoints
- `GET /orders` - Get all orders with filters (ADMIN)
- `GET /orders/statistics` - Get order statistics (ADMIN)
- `PATCH /orders/:id/status` - Update order status (ADMIN)
- `DELETE /orders/:id` - Delete order (ADMIN)

#### Health
- `GET /health` - Service health check

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15
- Docker & Docker Compose (optional)

### Local Development

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
Create a `.env` file:
```env
DATABASE_URL="postgresql://postgres:123456@localhost:5436/orders"
JWT_SECRET="youshop-secret-key"
KAFKA_BROKER="localhost:9092"
ENABLE_KAFKA="false"
PORT=3004
NODE_ENV="development"
```

3. **Generate Prisma client**:
```bash
npx prisma generate
```

4. **Run migrations**:
```bash
npx prisma migrate dev --name init
```

5. **Start the service**:
```bash
npm run start:dev
```

The service will be available at:
- API: http://localhost:3004
- Swagger Docs: http://localhost:3004/api/docs

### Docker Deployment

Using Docker Compose (from project root):

```bash
docker-compose up orders-service
```

Or build individually:

```bash
cd orders-service
docker build -t orders-service .
docker run -p 3004:3000 \
  -e DATABASE_URL="postgresql://postgres:123456@postgres-orders:5432/orders" \
  -e JWT_SECRET="youshop-secret-key" \
  orders-service
```

## 📊 Database Management

### Create Migration
```bash
npx prisma migrate dev --name description_of_changes
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

### Open Prisma Studio
```bash
npx prisma studio
```

### Reset Database (Development only)
```bash
npx prisma migrate reset
```

## 🔐 Authentication

All endpoints (except health checks) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Roles
- **CLIENT**: Can create and manage their own orders
- **ADMIN**: Full access to all orders and statistics

## 📝 Usage Examples

### Create Order

```bash
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "prod-123",
      "sku": "SKU-001",
      "productName": "Product Name",
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
    "country": "USA",
    "phone": "+1234567890"
  },
  "taxRate": 0.20,
  "shippingCost": 5.99,
  "paymentMethod": "credit_card"
}
```

### Update Order Status (Admin)

```bash
PATCH /orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "CONFIRMED",
  "paymentStatus": "PAID"
}
```

### Get My Orders

```bash
GET /orders/my-orders?page=1&limit=10
Authorization: Bearer <token>
```

## 🔄 Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓          ↓            ↓
CANCELLED  CANCELLED   CANCELLED

DELIVERED → REFUNDED
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3004/health
```

### Logs
The service uses NestJS Logger for structured logging. Logs include:
- Order creation
- Status updates
- Errors and exceptions
- Database operations

## 🔮 Future Enhancements

- [ ] Integration with Kafka for event-driven architecture
- [ ] Stock reservation/release events to inventory-service
- [ ] Email notifications for order status changes
- [ ] PDF invoice generation
- [ ] Order tracking number integration with shipping providers
- [ ] Refund processing workflow
- [ ] Advanced reporting and analytics
- [ ] Order templates and reordering

## 🤝 Integration Points

### With Auth Service
- Validates JWT tokens
- Uses user ID from token payload

### With Catalog Service
- References product IDs and SKUs
- Captures product snapshots at order time

### With Inventory Service (Future)
- Reserves stock when order is created
- Releases stock when order is cancelled
- Deducts stock when order is confirmed

## 📄 License

This project is part of the YouShop e-commerce platform.

## 👥 Support

For issues or questions, please contact the development team.
