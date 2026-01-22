INSERT INTO users (id, email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt") 
VALUES (gen_random_uuid(), 'admin@youshop.com', '$2b$10$8K1p/a0dL1LXMw/gQqIMku3RCwBEZa3pQvCCf6h5hMhJkJvQBVKdK', 'Admin', 'YouShop', 'ADMIN', true, NOW(), NOW()) 
ON CONFLICT (email) DO NOTHING;
