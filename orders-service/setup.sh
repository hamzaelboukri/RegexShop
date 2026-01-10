#!/bin/bash

echo "🚀 Setting up Orders Service..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✓ Prisma client generated successfully"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file. Please update it with your configuration."
else
    echo ""
    echo "✓ .env file already exists"
fi

# Run migrations
echo ""
echo "📊 Running database migrations..."
echo "Make sure PostgreSQL is running on port 5436"

read -p "Do you want to run migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name init
    
    if [ $? -eq 0 ]; then
        echo "✓ Migrations completed successfully"
    else
        echo "⚠️  Migrations failed. Please check your database connection."
    fi
fi

echo ""
echo "✅ Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run 'npm run start:dev' to start the service"
echo "3. Visit http://localhost:3004/api/docs for API documentation"
echo ""
echo "Or use Docker:"
echo "docker-compose up orders-service"
