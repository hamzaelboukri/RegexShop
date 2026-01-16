export const ServicesConfig = {
  auth: {
    name: 'auth-service',
    url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000',
    prefix: '/auth',
  },
  catalog: {
    name: 'catalog-service',
    url: process.env.CATALOG_SERVICE_URL || 'http://catalog-service:3000',
    prefix: '/catalog',
  },
  inventory: {
    name: 'inventory-service',
    url: process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3000',
    prefix: '/inventory',
  },
  orders: {
    name: 'orders-service',
    url: process.env.ORDERS_SERVICE_URL || 'http://orders-service:3000',
    prefix: '/orders',
  },
  payments: {
    name: 'payment-service',
    url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3000',
    prefix: '/payments',
  },
  notifications: {
    name: 'notification-service',
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3000',
    prefix: '/notifications',
  },
};

export type ServiceName = keyof typeof ServicesConfig;
