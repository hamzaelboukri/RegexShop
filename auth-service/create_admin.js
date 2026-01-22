const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin123!', 10);
  console.log('Hash:', hash);
  
  await prisma.user.create({
    data: {
      email: 'admin@youshop.com',
      password: hash,
      firstName: 'Admin',
      lastName: 'YouShop',
      role: 'ADMIN',
      isActive: true
    }
  });
  
  console.log('Admin created successfully!');
  await prisma.$disconnect();
}

main().catch(console.error);
