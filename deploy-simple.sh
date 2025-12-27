#!/bin/bash

# ============================================
# Simple Docker Deployment Script
# No docker-compose required
# ============================================

set -e

echo "==========================================="
echo "Finance App - Simple Docker Deployment"
echo "==========================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env file not found!"
    exit 1
fi

# Create Docker network if not exists
echo ""
echo "Creating Docker network..."
docker network create finance-network 2>/dev/null || echo "Network already exists"

# Stop and remove existing containers
echo ""
echo "Stopping existing containers..."
docker stop finance-backend 2>/dev/null || true
docker stop finance-frontend 2>/dev/null || true
docker rm finance-backend 2>/dev/null || true
docker rm finance-frontend 2>/dev/null || true

# Pull latest images
echo ""
echo "Pulling latest Docker images..."
docker pull jashank06/finance-backend:latest
docker pull jashank06/finance-frontend:latest

# Start Backend Container
echo ""
echo "Starting Backend container..."
docker run -d \
  --name finance-backend \
  --network finance-network \
  --restart unless-stopped \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e PORT=5001 \
  -e MONGODB_URI="${MONGODB_URI}" \
  -e JWT_SECRET="${JWT_SECRET}" \
  -e EMAIL_USER="${EMAIL_USER}" \
  -e EMAIL_PASS="${EMAIL_PASS}" \
  -e RAZORPAY_KEY_ID="${RAZORPAY_KEY_ID}" \
  -e RAZORPAY_KEY_SECRET="${RAZORPAY_KEY_SECRET}" \
  -e CLOUDINARY_CLOUD_NAME="${CLOUDINARY_CLOUD_NAME}" \
  -e CLOUDINARY_API_KEY="${CLOUDINARY_API_KEY}" \
  -e CLOUDINARY_API_SECRET="${CLOUDINARY_API_SECRET}" \
  -v backend-uploads:/app/uploads \
  jashank06/finance-backend:latest

echo "✅ Backend container started"

# Wait for backend to be ready
echo ""
echo "Waiting for backend to be ready..."
sleep 10

# Check if backend is healthy
for i in {1..30}; do
    if docker exec finance-backend node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
        echo "✅ Backend is healthy"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed"
        docker logs finance-backend --tail 50
        exit 1
    fi
    echo "Waiting... ($i/30)"
    sleep 2
done

# Start Frontend Container with custom nginx config
echo ""
echo "Starting Frontend container..."

# Check if custom nginx config exists
if [ -f "frontend/nginx.conf.simple" ]; then
    echo "Using custom nginx configuration..."
    docker run -d \
      --name finance-frontend \
      --network finance-network \
      --restart unless-stopped \
      -p 80:80 \
      -v "$(pwd)/frontend/nginx.conf.simple:/etc/nginx/conf.d/default.conf:ro" \
      jashank06/finance-frontend:latest
else
    echo "Using default nginx configuration..."
    docker run -d \
      --name finance-frontend \
      --network finance-network \
      --restart unless-stopped \
      -p 80:80 \
      jashank06/finance-frontend:latest
fi

echo "✅ Frontend container started"

# Show running containers
echo ""
echo "==========================================="
echo "Deployment Complete!"
echo "==========================================="
docker ps --filter "name=finance-"

echo ""
echo "📊 Container Status:"
docker ps --filter "name=finance-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Application URLs:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:5001"
echo ""
echo "📝 View Logs:"
echo "   Backend:  docker logs -f finance-backend"
echo "   Frontend: docker logs -f finance-frontend"
echo ""
echo "🛑 Stop Containers:"
echo "   docker stop finance-backend finance-frontend"
echo ""
