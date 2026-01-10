# 📡 Orders Service API Documentation

## Base URL
- **Local Development**: `http://localhost:3004`
- **Docker**: `http://localhost:3004`
- **Production**: `https://api.youshop.com/orders`

## Authentication
All endpoints (except health checks) require JWT authentication.

**Header Format**:
```
Authorization: Bearer <jwt_token>
```

## Order Status Lifecycle

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   ↓          ↓            ↓
CANCELLED  CANCELLED   CANCELLED

DELIVERED → REFUNDED
```

## Payment Status
- `UNPAID` - Payment not received
- `PAID` - Payment successful
- `FAILED` - Payment failed
- `REFUNDED` - Payment refunded

---

## Endpoints

### 1. Create Order
Create a new order with items and calculate totals.

**Endpoint**: `POST /orders`  
**Auth**: Required (CLIENT, ADMIN)

**Request Body**:
```json
{
  "items": [
    {
      "productId": "uuid",
      "sku": "SKU-001",
      "productName": "Product Name",
      "quantity": 2,
      "unitPrice": 29.99
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "billingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card",
  "notes": "Please deliver before 5 PM",
  "taxRate": 0.20,
  "shippingCost": 5.99
}
```

**Response**: `201 Created`
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-123456",
  "userId": "user-uuid",
  "status": "PENDING",
  "paymentStatus": "UNPAID",
  "subtotal": "59.98",
  "taxAmount": "11.99",
  "shippingCost": "5.99",
  "total": "77.96",
  "currency": "USD",
  "shippingAddress": {...},
  "billingAddress": {...},
  "items": [
    {
      "id": "item-uuid",
      "productId": "uuid",
      "sku": "SKU-001",
      "productName": "Product Name",
      "quantity": 2,
      "unitPrice": "29.99",
      "totalPrice": "59.98"
    }
  ],
  "createdAt": "2026-01-10T12:00:00Z",
  "updatedAt": "2026-01-10T12:00:00Z"
}
```

---

### 2. Get My Orders
Retrieve authenticated user's orders with pagination.

**Endpoint**: `GET /orders/my-orders`  
**Auth**: Required (CLIENT, ADMIN)

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example**: `GET /orders/my-orders?page=1&limit=10`

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-123456",
      "status": "PENDING",
      "total": "77.96",
      "items": [...],
      "createdAt": "2026-01-10T12:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 3. Get All Orders (Admin)
Retrieve all orders with filtering and pagination.

**Endpoint**: `GET /orders`  
**Auth**: Required (ADMIN only)

**Query Parameters**:
- `status` (optional): Filter by OrderStatus
- `paymentStatus` (optional): Filter by PaymentStatus
- `userId` (optional): Filter by user ID
- `orderNumber` (optional): Filter by order number
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example**: `GET /orders?status=PENDING&page=1&limit=20`

**Response**: `200 OK`
```json
{
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-123456",
      "userId": "user-uuid",
      "status": "PENDING",
      "paymentStatus": "UNPAID",
      "total": "77.96",
      "items": [...],
      "createdAt": "2026-01-10T12:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### 4. Get Order by ID
Retrieve a specific order by ID.

**Endpoint**: `GET /orders/:id`  
**Auth**: Required (CLIENT for own orders, ADMIN for all)

**Example**: `GET /orders/order-uuid-123`

**Response**: `200 OK`
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-123456",
  "userId": "user-uuid",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "subtotal": "59.98",
  "taxAmount": "11.99",
  "shippingCost": "5.99",
  "total": "77.96",
  "items": [...],
  "shippingAddress": {...},
  "paidAt": "2026-01-10T12:30:00Z",
  "createdAt": "2026-01-10T12:00:00Z",
  "updatedAt": "2026-01-10T12:30:00Z"
}
```

**Errors**:
- `404 Not Found` - Order not found
- `403 Forbidden` - Client trying to access another user's order

---

### 5. Get Order by Order Number
Retrieve a specific order by its order number.

**Endpoint**: `GET /orders/number/:orderNumber`  
**Auth**: Required (CLIENT for own orders, ADMIN for all)

**Example**: `GET /orders/number/ORD-123456`

**Response**: Same as Get Order by ID

---

### 6. Update Order Status (Admin)
Update the status of an order.

**Endpoint**: `PATCH /orders/:id/status`  
**Auth**: Required (ADMIN only)

**Request Body**:
```json
{
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "notes": "Payment verified"
}
```

**Response**: `200 OK`
```json
{
  "id": "order-uuid",
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "paidAt": "2026-01-10T12:30:00Z",
  ...
}
```

**Valid Status Transitions**:
- `PENDING` → `CONFIRMED`, `CANCELLED`
- `CONFIRMED` → `PROCESSING`, `CANCELLED`
- `PROCESSING` → `SHIPPED`, `CANCELLED`
- `SHIPPED` → `DELIVERED`
- `DELIVERED` → `REFUNDED`

**Errors**:
- `400 Bad Request` - Invalid status transition
- `404 Not Found` - Order not found

---

### 7. Cancel Order
Cancel an order (only allowed in certain statuses).

**Endpoint**: `POST /orders/:id/cancel`  
**Auth**: Required (CLIENT for own orders, ADMIN for all)

**Example**: `POST /orders/order-uuid-123/cancel`

**Response**: `200 OK`
```json
{
  "id": "order-uuid",
  "status": "CANCELLED",
  "cancelledAt": "2026-01-10T13:00:00Z",
  ...
}
```

**Restrictions**:
- Can only cancel orders in `PENDING` or `CONFIRMED` status
- Clients can only cancel their own orders

**Errors**:
- `400 Bad Request` - Cannot cancel order in current status
- `403 Forbidden` - Not authorized to cancel this order
- `404 Not Found` - Order not found

---

### 8. Get Order Statistics (Admin)
Get overall order statistics and revenue.

**Endpoint**: `GET /orders/statistics`  
**Auth**: Required (ADMIN only)

**Response**: `200 OK`
```json
{
  "totalOrders": 1523,
  "pendingOrders": 45,
  "completedOrders": 1298,
  "cancelledOrders": 180,
  "totalRevenue": "125890.50"
}
```

---

### 9. Delete Order (Admin)
Permanently delete an order (for testing/admin purposes).

**Endpoint**: `DELETE /orders/:id`  
**Auth**: Required (ADMIN only)

**Response**: `200 OK`
```json
{
  "message": "Order deleted successfully"
}
```

**Warning**: This permanently deletes the order and all related items.

---

### 10. Health Check
Check service and database health.

**Endpoint**: `GET /health`  
**Auth**: Not required

**Response**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T12:00:00Z",
  "service": "orders-service",
  "database": "connected"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Order must contain at least one item",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Order with ID xyz not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## Testing with cURL

### Create Order
```bash
curl -X POST http://localhost:3004/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{
      "productId": "prod-123",
      "sku": "SKU-001",
      "productName": "Test Product",
      "quantity": 2,
      "unitPrice": 29.99
    }],
    "shippingAddress": {
      "fullName": "John Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    },
    "taxRate": 0.20
  }'
```

### Get My Orders
```bash
curl http://localhost:3004/orders/my-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Update Order Status (Admin)
```bash
curl -X PATCH http://localhost:3004/orders/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED",
    "paymentStatus": "PAID"
  }'
```

---

## Postman Collection

Import the following into Postman:

```json
{
  "info": {
    "name": "Orders Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{"key": "token", "value": "{{jwt_token}}"}]
  },
  "item": [...]
}
```

Or use the Swagger UI at: **http://localhost:3004/api/docs**

---

## Rate Limiting & Pagination

- **Default Page Size**: 10 items
- **Maximum Page Size**: 100 items
- **Rate Limiting**: To be implemented (recommended: 100 requests/minute per user)

---

## Webhooks (Future)

Future versions will support webhooks for:
- Order status changes
- Payment confirmations
- Cancellations
- Deliveries
