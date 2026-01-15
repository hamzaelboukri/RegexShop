# Notification Service

Notification microservice for the Regex Shop e-commerce platform, providing real-time WebSocket notifications and email delivery.

## Features

- **WebSocket Gateway**: Real-time notifications using Socket.io
- **Multi-Channel Delivery**: Send notifications via WebSocket and Email simultaneously
- **Email Templates**: Beautiful HTML email templates using Handlebars
- **User Preferences**: Configurable notification preferences per user
- **Event-Driven**: Responds to internal events (payment, order, stock alerts)
- **Admin Alerts**: Special stock alerts for administrators

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Socket.io** - Real-time bidirectional communication
- **Nodemailer** - Email sending
- **Handlebars** - Email templating
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Primary database
- **TypeScript** - Full type safety

## API Endpoints

### Notifications
- `POST /notifications` - Create and send a notification
- `GET /notifications` - Get current user's notifications
- `PUT /notifications/:id/read` - Mark notification as read
- `PUT /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete a notification

### Preferences
- `GET /notifications/preferences` - Get notification preferences
- `PUT /notifications/preferences` - Update preferences

### Health
- `GET /health` - Health check with WebSocket stats
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check
- `GET /health/websocket` - WebSocket connection stats

## WebSocket Events

### Client -> Server
- `subscribe` - Subscribe to a channel
- `unsubscribe` - Unsubscribe from a channel
- `ping` - Heartbeat ping
- `markAsRead` - Mark notification as read

### Server -> Client
- `connected` - Connection confirmed
- `notification` - New notification
- `admin_alert` - Admin alert (for admin users)
- `stock_alert` - Stock alert (for admin users)
- `broadcast` - System-wide broadcast

## WebSocket Connection

Connect to the WebSocket gateway at `/notifications` namespace:

```javascript
const socket = io('http://localhost:3006/notifications', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/notifications

# JWT
JWT_SECRET=your-jwt-secret

# SMTP (Email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@regexshop.com
SMTP_FROM_NAME=Regex Shop

# URLs
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000

# Service
PORT=3006
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

## Testing WebSocket Connection

You can test the WebSocket connection using a simple HTML file or tools like Postman.

## Internal Events

The service listens to these internal events:
- `payment.succeeded` - Triggers payment success notification
- `payment.failed` - Triggers payment failure notification
- `payment.refunded` - Triggers refund notification
- `order.created` - Triggers order confirmation
- `order.status.changed` - Triggers order status update
- `stock.alert` - Triggers stock alert to admins

## API Documentation

Swagger documentation available at `/api/docs` when running the service.
