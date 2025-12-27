# EC2 Deployment Fix Instructions

## Problem Summary
Nginx container was failing with error: `host not found in upstream "backend"`

## Root Cause
- The `nginx.conf.production` file was configured for SSL/HTTPS setup
- SSL certificates were not available
- The config was redirecting HTTP to HTTPS causing failures

## Solution Applied

### 1. Created Simple Production Config
Created `frontend/nginx.conf.production.simple` - HTTP-only configuration without SSL

### 2. Updated Docker Compose
Modified `docker-compose.prod-secure.yml` to use the simple config

## Deployment Steps on EC2

### Step 1: Stop and Remove Existing Containers
```bash
cd ~/your-project-directory
docker-compose -f docker-compose.prod-secure.yml down
```

### Step 2: Pull Latest Code (if deploying from repo)
```bash
git pull origin main
```

### Step 3: Copy the New Files to EC2
If you're deploying from your local machine, upload these files:
- `frontend/nginx.conf.production.simple`
- `docker-compose.prod-secure.yml`

```bash
# On your local machine
scp -i your-key.pem frontend/nginx.conf.production.simple ec2-user@13.235.53.147:~/Finance/frontend/
scp -i your-key.pem docker-compose.prod-secure.yml ec2-user@13.235.53.147:~/Finance/
```

### Step 4: Deploy on EC2
```bash
# SSH to EC2
ssh -i your-key.pem ec2-user@13.235.53.147

# Navigate to project directory
cd ~/Finance

# Make sure .env file exists with all required variables
ls -la .env

# Start services
docker-compose -f docker-compose.prod-secure.yml up -d

# Check logs
docker-compose -f docker-compose.prod-secure.yml logs -f
```

### Step 5: Verify Deployment
```bash
# Check running containers
docker ps

# Check nginx logs
docker logs finance-frontend

# Check backend logs
docker logs finance-backend

# Test the application
curl http://localhost/health
curl http://localhost/api/health
```

### Step 6: Access Application
Open browser: http://13.235.53.147/

## What Changed?

### Before:
- Used `nginx.conf.production` with SSL configuration
- Required SSL certificates at `/etc/nginx/ssl/`
- Redirected all HTTP to HTTPS
- Failed when SSL certs not found

### After:
- Using `nginx.conf.production.simple`
- HTTP-only (port 80)
- No SSL requirement
- Works immediately with IP address

## Future SSL Setup (Optional)

When you get a domain name and want SSL:

1. Point domain to EC2 IP
2. Install certbot on EC2
3. Generate Let's Encrypt certificates
4. Switch back to `nginx.conf.production`
5. Update docker-compose to mount SSL certs

## Troubleshooting

### If nginx still fails:
```bash
# Check if backend is running
docker ps | grep backend

# Check backend logs
docker logs finance-backend

# Check nginx config syntax
docker exec finance-frontend nginx -t

# Restart services
docker-compose -f docker-compose.prod-secure.yml restart
```

### If "backend not found" error persists:
```bash
# Check Docker network
docker network inspect finance_finance-network

# Both containers should be in same network
```

### If containers keep restarting:
```bash
# Check logs for specific error
docker logs finance-frontend --tail 100
docker logs finance-backend --tail 100
```
