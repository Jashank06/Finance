# EC2 Simple Docker Deployment Guide

## 🎯 Overview
Deploy Finance app on EC2 using **simple Docker commands** (NO docker-compose)

---

## 📋 Prerequisites

### 1. EC2 Instance Setup
- Docker installed
- Ports 80 and 5001 open in Security Group
- `.env` file with all required variables

### 2. Environment Variables Required
Create `.env` file on EC2:
```bash
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

---

## 🚀 Deployment Steps

### Option 1: Using Deployment Script (Recommended)

#### Step 1: Upload Files to EC2
```bash
# From your local machine
scp -i your-key.pem deploy-simple.sh ec2-user@13.235.53.147:~/Finance/
scp -i your-key.pem .env ec2-user@13.235.53.147:~/Finance/
```

#### Step 2: SSH to EC2 and Deploy
```bash
ssh -i your-key.pem ec2-user@13.235.53.147
cd ~/Finance

# Make script executable
chmod +x deploy-simple.sh

# Run deployment
./deploy-simple.sh
```

---

### Option 2: Manual Docker Commands

#### Step 1: Create Docker Network
```bash
docker network create finance-network
```

#### Step 2: Stop Existing Containers (if any)
```bash
docker stop finance-backend finance-frontend 2>/dev/null || true
docker rm finance-backend finance-frontend 2>/dev/null || true
```

#### Step 3: Pull Latest Images
```bash
docker pull jashank06/finance-backend:latest
docker pull jashank06/finance-frontend:latest
```

#### Step 4: Start Backend Container
```bash
docker run -d \
  --name finance-backend \
  --network finance-network \
  --restart unless-stopped \
  -p 5001:5001 \
  -e NODE_ENV=production \
  -e PORT=5001 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e JWT_SECRET="your_jwt_secret" \
  -e EMAIL_USER="your_email" \
  -e EMAIL_PASS="your_email_password" \
  -e RAZORPAY_KEY_ID="your_razorpay_key" \
  -e RAZORPAY_KEY_SECRET="your_razorpay_secret" \
  -e CLOUDINARY_CLOUD_NAME="your_cloudinary_name" \
  -e CLOUDINARY_API_KEY="your_cloudinary_key" \
  -e CLOUDINARY_API_SECRET="your_cloudinary_secret" \
  -v backend-uploads:/app/uploads \
  jashank06/finance-backend:latest
```

#### Step 5: Wait for Backend (30 seconds)
```bash
sleep 30
```

#### Step 6: Start Frontend Container
```bash
docker run -d \
  --name finance-frontend \
  --network finance-network \
  --restart unless-stopped \
  -p 80:80 \
  jashank06/finance-frontend:latest
```

---

## ✅ Verify Deployment

### Check Running Containers
```bash
docker ps
```

You should see both containers running:
```
CONTAINER ID   IMAGE                                  STATUS         PORTS
xxxxxxxxx      jashank06/finance-frontend:latest      Up 1 minute    0.0.0.0:80->80/tcp
xxxxxxxxx      jashank06/finance-backend:latest       Up 2 minutes   0.0.0.0:5001->5001/tcp
```

### Check Logs
```bash
# Backend logs
docker logs finance-backend

# Frontend logs  
docker logs finance-frontend

# Follow logs in real-time
docker logs -f finance-frontend
```

### Test Application
```bash
# Test backend
curl http://localhost:5001/api/health

# Test frontend
curl http://localhost/health

# Or open in browser
http://13.235.53.147/
```

---

## 🔧 Management Commands

### View Logs
```bash
# All logs
docker logs finance-backend
docker logs finance-frontend

# Last 50 lines
docker logs --tail 50 finance-backend

# Follow live logs
docker logs -f finance-frontend
```

### Restart Containers
```bash
docker restart finance-backend
docker restart finance-frontend
```

### Stop Containers
```bash
docker stop finance-backend finance-frontend
```

### Remove Containers
```bash
docker stop finance-backend finance-frontend
docker rm finance-backend finance-frontend
```

### Update to Latest Version
```bash
# Stop and remove old containers
docker stop finance-backend finance-frontend
docker rm finance-backend finance-frontend

# Pull latest images
docker pull jashank06/finance-backend:latest
docker pull jashank06/finance-frontend:latest

# Start again with same commands or run deploy-simple.sh
./deploy-simple.sh
```

---

## 🐛 Troubleshooting

### Issue: Backend Container Not Starting

**Check logs:**
```bash
docker logs finance-backend --tail 100
```

**Common causes:**
- MongoDB URI incorrect
- Environment variables missing
- Port 5001 already in use

**Fix:**
```bash
# Check if port is in use
sudo netstat -tulpn | grep 5001

# Kill process if needed
sudo kill -9 <PID>
```

### Issue: Frontend Shows "backend not found"

**Verify network:**
```bash
docker network inspect finance-network
```

Both containers should be in the same network.

**Restart frontend:**
```bash
docker restart finance-frontend
```

### Issue: Cannot Access from Browser

**Check EC2 Security Group:**
- Port 80 (HTTP) should be open to 0.0.0.0/0
- Port 5001 should be open (or only from frontend if secured)

**Check if nginx is running:**
```bash
docker exec finance-frontend nginx -t
docker exec finance-frontend ps aux | grep nginx
```

### Issue: Environment Variables Not Working

**Load from .env file properly:**
```bash
export $(cat .env | grep -v '^#' | xargs)
```

**Or pass each variable explicitly in docker run command**

---

## 📊 Current Deployment Status

After running the deployment, you'll see:

```
=========================================
Deployment Complete!
=========================================
CONTAINER ID   IMAGE                                  STATUS         PORTS
xxxxxxxxx      jashank06/finance-frontend:latest      Up 1 minute    0.0.0.0:80->80/tcp
xxxxxxxxx      jashank06/finance-backend:latest       Up 2 minutes   0.0.0.0:5001->5001/tcp

📊 Container Status:
NAMES                STATUS              PORTS
finance-frontend     Up 1 minute         0.0.0.0:80->80/tcp
finance-backend      Up 2 minutes        0.0.0.0:5001->5001/tcp

🌐 Application URLs:
   Frontend: http://localhost
   Backend:  http://localhost:5001

📝 View Logs:
   Backend:  docker logs -f finance-backend
   Frontend: docker logs -f finance-frontend

🛑 Stop Containers:
   docker stop finance-backend finance-frontend
```

---

## 🔐 Production Best Practices

### 1. Use .env File for Secrets
Never commit `.env` to git or expose secrets in commands

### 2. Regular Updates
```bash
# Weekly or as needed
docker pull jashank06/finance-backend:latest
docker pull jashank06/finance-frontend:latest
./deploy-simple.sh
```

### 3. Monitor Logs
```bash
# Set up log monitoring
docker logs -f finance-backend > backend.log 2>&1 &
docker logs -f finance-frontend > frontend.log 2>&1 &
```

### 4. Backup Data
```bash
# Backup uploaded files volume
docker run --rm -v backend-uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz /data
```

---

## 📞 Quick Reference

| Action | Command |
|--------|---------|
| Deploy | `./deploy-simple.sh` |
| View logs | `docker logs -f finance-frontend` |
| Stop all | `docker stop finance-backend finance-frontend` |
| Restart | `docker restart finance-backend finance-frontend` |
| Status | `docker ps` |
| Remove | `docker rm finance-backend finance-frontend` |
| Network | `docker network inspect finance-network` |

---

## ✨ What's Different from docker-compose?

### docker-compose:
- Uses YAML file
- Single command to manage multiple containers
- Automatic network creation

### Simple Docker:
- Direct docker commands
- More control
- No additional tools needed
- Same functionality

Both approaches work equally well! This guide uses simple Docker commands as requested.
