#!/bin/bash

# ================================
# Palbamb Deployment Script
# Domains: palbamb.com, palbamb.in
# Server: 13.235.53.147
# ================================

set -e  # Exit on error

echo "🚀 Starting Palbamb Deployment..."
echo "=================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Stop existing containers
echo -e "${BLUE}📦 Stopping existing containers...${NC}"
docker-compose -f docker-compose.prod.yml down || true

# Step 2: Backup .env files
echo -e "${BLUE}💾 Backing up environment files...${NC}"
cp backend/.env backend/.env.backup.$(date +%Y%m%d_%H%M%S) || true

# Step 3: Update backend .env
echo -e "${BLUE}⚙️  Updating backend environment...${NC}"
cp backend/.env.production backend/.env

# Step 4: Build Backend
echo -e "${BLUE}🔨 Building backend image...${NC}"
cd backend
docker build -t finance-backend:latest .
cd ..

# Step 5: Build Frontend with correct nginx config
echo -e "${BLUE}🔨 Building frontend image...${NC}"
cd frontend

# Copy the correct nginx config for production
cp nginx.conf.ec2 nginx.conf

docker build -t finance-frontend:latest .
cd ..

# Step 6: Start containers
echo -e "${BLUE}🚀 Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Step 7: Wait for services to start
echo -e "${BLUE}⏳ Waiting for services to start...${NC}"
sleep 10

# Step 8: Health checks
echo -e "${BLUE}🏥 Running health checks...${NC}"

# Check backend
if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Check frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
fi

# Step 9: Show container status
echo ""
echo -e "${BLUE}📊 Container Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Step 10: Show logs
echo ""
echo -e "${BLUE}📜 Recent Logs:${NC}"
echo "=================================="
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=================================="
echo "🌐 Your application is now live at:"
echo "   - http://palbamb.com"
echo "   - http://palbamb.in"
echo "   - http://13.235.53.147"
echo ""
echo "📝 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🔄 To restart services:"
echo "   docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
