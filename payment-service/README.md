# Payment Service

Payment microservice for the Regex Shop e-commerce platform, handling secure payment processing with Stripe integration.

## Features

- **Stripe Checkout Sessions**: Secure PCI-compliant payment processing
- **Webhook Handling**: Real-time payment event processing with signature validation
- **Idempotency**: Guaranteed single payment processing per request
- **Transaction Logging**: Complete audit trail of all payment operations
- **Refund Support**: Process full or partial refunds

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **Stripe** - Payment processing
- **TypeScript** - Full type safety

## API Endpoints

### Payments
- `POST /payments` - Create a new payment with Stripe checkout session
- `GET /payments/:id` - Get payment by ID
- `GET /payments/order/:orderId` - Get payment by order ID
- `GET /payments/my-payments` - Get current user's payments
- `GET /payments/idempotency-key` - Generate unique idempotency key
- `POST /payments/:id/refund` - Create a refund

### Webhooks
- `POST /webhooks/stripe` - Handle Stripe webhook events

### Health
- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/payments

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-jwt-secret

# URLs
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Service
PORT=3005
NODE_ENV=development
```

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## Stripe Webhook Testing

For local development, use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3005/webhooks/stripe
```

## API Documentation

Swagger documentation available at `/api/docs` when running the service.
