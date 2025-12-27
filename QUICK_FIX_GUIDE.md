# 🚀 Quick Fix Guide - MIME Type Error Solution

## Problem You Were Facing
```
Failed to load module script: Expected a JavaScript-or-Wasm module script 
but the server responded with a MIME type of "text/html"
```

## Root Causes Fixed
1. ❌ **Wrong Backend URL**: `host.docker.internal:5001` (doesn't work on Linux)
2. ❌ **Missing MIME Types**: JavaScript files served as HTML
3. ❌ **No Caching**: Assets not cached properly

## Solution Applied ✅

### 1. New Nginx Config Created
**File:** `frontend/nginx.conf.simple`

**Key Changes:**
- ✅ Uses Docker service name: `finance-backend:5001` (instead of host.docker.internal)
- ✅ Proper MIME types for `.js`, `.mjs`, `.css` files
- ✅ Caching for assets (1 year)
- ✅ Gzip compression enabled
- ✅ Security headers added

### 2. Deploy Script Updated
**File:** `deploy-simple.sh`
- Now mounts custom nginx config automatically

---

## 🎯 Deploy on EC2 Now

### Step 1: Upload Files to EC2
```bash
# From your local machine
scp -i your-key.pem frontend/nginx.conf.simple ec2-user@13.235.53.147:~/Finance/frontend/
scp -i your-key.pem deploy-simple.sh ec2-user@13.235.53.147:~/Finance/
```

### Step 2: SSH and Deploy
```bash
ssh -i your-key.pem ec2-user@13.235.53.147
cd ~/Finance

# Make sure .env exists
ls -la .env

# Run deployment
chmod +x deploy-simple.sh
./deploy-simple.sh
```

---

## 📝 Manual Deployment (If Script Doesn't Work)

```bash
# 1. Create network
docker network create finance-network

# 2. Stop old containers
docker stop finance-backend finance-frontend 2>/dev/null || true
docker rm finance-backend finance-frontend 2>/dev/null || true

# 3. Start Backend
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
  jashank06/finance-backend:latest

# 4. Wait for backend
sleep 30

# 5. Start Frontend with custom nginx config
docker run -d \
  --name finance-frontend \
  --network finance-network \
  --restart unless-stopped \
  -p 80:80 \
  -v "$(pwd)/frontend/nginx.conf.simple:/etc/nginx/conf.d/default.conf:ro" \
  jashank06/finance-frontend:latest
```

---

## ✅ Verify Fix

### 1. Check Containers Running
```bash
docker ps
```

Should show:
```
CONTAINER ID   IMAGE                                  STATUS
xxxxxxxxx      jashank06/finance-frontend:latest      Up 1 minute
xxxxxxxxx      jashank06/finance-backend:latest       Up 2 minutes
```

### 2. Check Nginx Config Loaded
```bash
docker exec finance-frontend cat /etc/nginx/conf.d/default.conf
```

Should show the new config with `finance-backend:5001`

### 3. Check Logs
```bash
# Should NOT show MIME errors
docker logs finance-frontend

# Should show successful requests
docker logs finance-frontend --tail 20
```

### 4. Test in Browser
Open: http://13.235.53.147/

**Check browser console (F12):**
- ✅ NO MIME type errors
- ✅ JavaScript files load properly
- ✅ Assets cached correctly

### 5. Check Network Connectivity
```bash
# Test if frontend can reach backend
docker exec finance-frontend wget -O- http://finance-backend:5001/api/health
```

Should return: `{"status":"ok"}` or similar

---

## 🐛 Troubleshooting

### Issue 1: Still Getting MIME Error

**Check nginx config is mounted:**
```bash
docker exec finance-frontend cat /etc/nginx/conf.d/default.conf | grep "finance-backend"
```

Should show: `proxy_pass http://finance-backend:5001;`

**If not mounted, restart with volume:**
```bash
docker stop finance-frontend
docker rm finance-frontend

docker run -d \
  --name finance-frontend \
  --network finance-network \
  --restart unless-stopped \
  -p 80:80 \
  -v "$(pwd)/frontend/nginx.conf.simple:/etc/nginx/conf.d/default.conf:ro" \
  jashank06/finance-frontend:latest
```

### Issue 2: Backend Connection Refused

**Check both containers in same network:**
```bash
docker network inspect finance-network
```

Both `finance-backend` and `finance-frontend` should be listed.

**Check backend is healthy:**
```bash
docker exec finance-backend curl http://localhost:5001/api/health
```

### Issue 3: 404 on Assets

**Check if assets exist in container:**
```bash
docker exec finance-frontend ls -la /usr/share/nginx/html/assets/
```

**Check nginx logs:**
```bash
docker logs finance-frontend | grep "404"
```

---

## 📊 What Changed Summary

| Before | After |
|--------|-------|
| `host.docker.internal:5001` | `finance-backend:5001` |
| No MIME types defined | Proper MIME types for JS/CSS |
| No caching | 1 year cache for assets |
| No gzip | Gzip compression enabled |
| Manual docker run | Automated script |

---

## 🎉 Expected Result

After deployment, you should see:

1. **No console errors** in browser
2. **Fast loading** (assets cached)
3. **All features working** (API calls successful)
4. **Clean logs** (no 404s or MIME errors)

---

## 📞 Quick Commands Reference

```bash
# Deploy
./deploy-simple.sh

# Check status
docker ps

# View logs
docker logs -f finance-frontend

# Restart frontend
docker restart finance-frontend

# Stop all
docker stop finance-backend finance-frontend

# Clean up
docker rm finance-backend finance-frontend
docker network rm finance-network
```

---

## 🔥 One-Line Quick Fix

If everything is already uploaded to EC2:

```bash
ssh -i your-key.pem ec2-user@13.235.53.147 "cd ~/Finance && chmod +x deploy-simple.sh && ./deploy-simple.sh"
```

This will deploy everything automatically!
