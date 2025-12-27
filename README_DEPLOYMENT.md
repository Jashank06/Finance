# 🚀 Finance App - Deployment Documentation

## 📚 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Deployment Options](#deployment-options)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

## Overview

This guide covers deploying the Finance App on AWS EC2 t4g.nano instance with Docker and Jenkins CI/CD automation.

## Architecture

```
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │ (webhook)
         ▼
┌─────────────────┐
│    Jenkins      │  ← Build & Deploy
│   (EC2:8080)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│         AWS EC2 t4g.nano        │
│  ┌─────────────────────────┐   │
│  │   Docker Containers     │   │
│  │                         │   │
│  │  ┌──────────────────┐  │   │
│  │  │   Frontend       │  │   │
│  │  │   (Nginx:80)     │  │   │
│  │  └──────────────────┘  │   │
│  │          ↓              │   │
│  │  ┌──────────────────┐  │   │
│  │  │   Backend        │  │   │
│  │  │   (Node:5001)    │  │   │
│  │  └──────────────────┘  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB Atlas  │
└─────────────────┘
```

## Prerequisites

### Local Development:
- Docker & Docker Compose
- Git
- Node.js 18+ (for local testing)

### AWS Setup:
- AWS Account
- EC2 instance (t4g.nano with ARM64)
- Security groups configured
- Key pair (.pem file)

### External Services:
- MongoDB Atlas account
- Docker Hub account
- Email account (for OTP)
- Razorpay account (for payments)
- Cloudinary account (for uploads)

## Quick Start

### 1️⃣ Local Testing

```bash
# Clone repository
git clone https://github.com/your-username/finance-app.git
cd finance-app

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Deploy with Docker
./deploy.sh

# Or manually
docker-compose up -d

# View logs
docker-compose logs -f

# Access application
# Frontend: http://localhost
# Backend: http://localhost:5001/api
```

### 2️⃣ EC2 Deployment

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Follow detailed steps in EC2_SETUP.md
```

### 3️⃣ Jenkins CI/CD

```bash
# Setup Jenkins on EC2
# Follow detailed steps in JENKINS_SETUP.md

# Configure pipeline
# Push code → Auto deploy ✨
```

## Deployment Options

### Option 1: Manual Deployment
- Build locally
- Push to Docker Hub
- Pull on EC2
- Best for: Initial setup, testing

### Option 2: Jenkins CI/CD
- Automated build & deploy
- GitHub webhook integration
- Best for: Production, continuous delivery

### Option 3: GitHub Actions
- Alternative to Jenkins
- Cloud-based CI/CD
- Best for: Simple workflows

## 📦 Docker Images

### Backend:
- **Image**: `your-username/finance-backend`
- **Base**: node:18-alpine (ARM64)
- **Size**: ~150MB
- **Port**: 5001

### Frontend:
- **Image**: `your-username/finance-frontend`
- **Base**: nginx:alpine (ARM64)
- **Size**: ~50MB
- **Port**: 80

## 🔧 Configuration

### Environment Variables (.env):

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-secret-key

# Email (OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password

# Payment Gateway
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Cloud Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 📊 Monitoring

### Container Health:
```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Resource usage
docker stats
```

### Application Health:
```bash
# Backend health check
curl http://localhost:5001/api/health

# Frontend health check
curl http://localhost:80
```

### System Resources:
```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU usage
top
```

## 🔍 Troubleshooting

### Common Issues:

#### 1. Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Verify environment variables
docker-compose exec backend printenv

# Check port availability
sudo lsof -i :5001
```

#### 2. Out of Memory (t4g.nano)
```bash
# Add swap space
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### 3. Database Connection Failed
```bash
# Verify MongoDB URI
echo $MONGODB_URI

# Test connection
docker-compose exec backend node -e "
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected'))
    .catch(err => console.error('Failed:', err));
"
```

#### 4. Frontend Can't Reach Backend
```bash
# Check nginx proxy configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Test internal network
docker-compose exec frontend ping backend
```

## 🔄 Update & Rollback

### Update Application:
```bash
# Pull latest code
cd ~/finance-app
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Rollback:
```bash
# Tag stable versions
docker tag backend:latest backend:stable
docker tag frontend:latest frontend:stable

# Rollback to stable
docker-compose down
docker pull your-username/finance-backend:stable
docker pull your-username/finance-frontend:stable
docker-compose up -d
```

## 📈 Performance Optimization

### For t4g.nano (512MB RAM):

1. **Use External Database**: MongoDB Atlas instead of self-hosted
2. **Enable Swap**: Add 1GB swap space
3. **Optimize Images**: Multi-stage builds (already implemented)
4. **Gzip Compression**: Enabled in Nginx
5. **Resource Limits**: Set in docker-compose if needed

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

## 🔒 Security Checklist

- ✅ Use environment variables for secrets
- ✅ Restrict SSH to your IP only
- ✅ Use HTTPS with SSL certificate
- ✅ Keep Docker images updated
- ✅ Enable CloudWatch monitoring
- ✅ Setup automated backups
- ✅ Use AWS Secrets Manager
- ✅ Regular security updates

## 📚 Additional Documentation

- **[EC2_SETUP.md](./EC2_SETUP.md)** - Detailed EC2 setup guide
- **[JENKINS_SETUP.md](./JENKINS_SETUP.md)** - Jenkins CI/CD configuration
- **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Docker specifics

## 🆘 Support

### Logs Location:
- **Backend**: `docker-compose logs backend`
- **Frontend**: `docker-compose logs frontend`
- **Jenkins**: `/var/log/jenkins/jenkins.log`
- **Nginx**: `docker-compose exec frontend cat /var/log/nginx/error.log`

### Useful Commands:
```bash
# View all containers
docker ps -a

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend sh

# Check disk usage
docker system df

# Clean up
docker system prune -a
```

## 🎯 Production Checklist

Before going live:

- [ ] Setup domain name and DNS
- [ ] Configure SSL certificate
- [ ] Setup monitoring (CloudWatch)
- [ ] Configure automated backups
- [ ] Test disaster recovery
- [ ] Setup log aggregation
- [ ] Configure alerts
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

## 📞 Contact

For issues or questions:
- Create an issue on GitHub
- Check logs first
- Verify configuration

---

**Deployment made easy! 🚀**

Choose your deployment method and follow the detailed guide for step-by-step instructions.
