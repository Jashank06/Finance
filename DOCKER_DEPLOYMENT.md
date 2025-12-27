# Docker Deployment Guide

## 🐳 Quick Start - Local Testing

### Prerequisites:
- Docker installed
- Docker Compose installed

### Steps:

1. **Clone the repository**:
```bash
git clone https://github.com/your-username/finance-app.git
cd finance-app
```

2. **Create .env file**:
```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

3. **Deploy with Docker Compose**:
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

4. **Access the application**:
- Frontend: http://localhost
- Backend API: http://localhost:5001/api

## 📦 Docker Images

### Backend Image:
- **Base**: node:18-alpine (ARM64 compatible)
- **Port**: 5001
- **Health Check**: /api/health endpoint

### Frontend Image:
- **Base**: nginx:alpine (ARM64 compatible)
- **Port**: 80
- **Features**: 
  - Built with Vite
  - Nginx with API proxy
  - React Router support

## 🔧 Manual Build

### Build Backend:
```bash
cd backend
docker build -t finance-backend:latest .
docker run -p 5001:5001 --env-file .env finance-backend:latest
```

### Build Frontend:
```bash
cd frontend
docker build -t finance-frontend:latest .
docker run -p 80:80 finance-frontend:latest
```

## 🚀 Production Deployment

### Push to Docker Hub:
```bash
# Login to Docker Hub
docker login

# Tag images
docker tag finance-backend:latest your-username/finance-backend:latest
docker tag finance-frontend:latest your-username/finance-frontend:latest

# Push images
docker push your-username/finance-backend:latest
docker push your-username/finance-frontend:latest
```

### Pull and Run on EC2:
```bash
# On EC2 instance
docker pull your-username/finance-backend:latest
docker pull your-username/finance-frontend:latest

docker-compose up -d
```

## 🔍 Useful Commands

### View Logs:
```bash
# All containers
docker-compose logs -f

# Specific container
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Containers:
```bash
docker-compose restart
```

### Stop & Remove:
```bash
docker-compose down
```

### Rebuild:
```bash
docker-compose up -d --build
```

### Execute commands in container:
```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

### Check container health:
```bash
docker-compose ps
docker inspect finance-backend | grep -A 10 Health
```

## 🐛 Debugging

### Container not starting:
```bash
# Check logs
docker-compose logs backend

# Check if port is in use
sudo lsof -i :5001
sudo lsof -i :80
```

### Environment variables not loaded:
```bash
# Verify .env file exists
cat .env

# Check if variables are passed to container
docker-compose exec backend printenv
```

### Network issues:
```bash
# Inspect network
docker network ls
docker network inspect finance_finance-network

# Test connectivity
docker-compose exec frontend ping backend
```

## 📊 Resource Monitoring

### Check resource usage:
```bash
docker stats

# For specific containers
docker stats finance-backend finance-frontend
```

## 🔄 CI/CD Integration

### GitHub Actions Example:
```yaml
name: Deploy to EC2

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and Push Docker Images
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/finance-backend:latest ./backend
          docker build -t ${{ secrets.DOCKER_USERNAME }}/finance-frontend:latest ./frontend
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push ${{ secrets.DOCKER_USERNAME }}/finance-backend:latest
          docker push ${{ secrets.DOCKER_USERNAME }}/finance-frontend:latest
      
      - name: Deploy to EC2
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ec2-user
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd ~/finance-app
            docker-compose pull
            docker-compose up -d
```

## 🎯 Optimization Tips

1. **Multi-stage builds**: Already implemented for smaller images
2. **Layer caching**: Copy package.json before source code
3. **Docker ignore**: Exclude unnecessary files
4. **Health checks**: Monitor container health
5. **Resource limits**: Add in docker-compose.yml if needed

## 📝 Notes

- Images are built for **ARM64** architecture (t4g.nano)
- Frontend uses Nginx for serving static files and API proxy
- Backend health endpoint: `/api/health`
- All logs are available via `docker-compose logs`

