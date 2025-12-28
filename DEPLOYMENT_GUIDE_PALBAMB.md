# 🚀 Deployment Guide for Palbamb.com & Palbamb.in

## Domain Configuration
- **Primary Domain**: palbamb.com
- **Secondary Domain**: palbamb.in
- **Server IP**: 13.235.53.147
- **Backend Port**: 5001
- **Frontend Port**: 80

---

## 📋 Pre-Deployment Checklist

### 1. DNS Configuration (Already Done ✅)
Ensure your DNS records point to the server:

**A Records:**
```
palbamb.com         →  13.235.53.147
www.palbamb.com     →  13.235.53.147
palbamb.in          →  13.235.53.147
www.palbamb.in      →  13.235.53.147
```

Verify DNS propagation:
```bash
nslookup palbamb.com
nslookup palbamb.in
```

---

## 🔧 Configuration Changes Made

### Backend Configuration
✅ Updated `backend/.env.production`:
- CORS origins include both domains and IP
- Frontend URL set to https://palbamb.com

### Frontend Configuration
✅ Updated nginx configurations:
- `frontend/nginx.conf.ec2` - For current HTTP deployment
- `frontend/nginx.conf.production.simple` - For simple HTTP setup
- `frontend/nginx.conf.production` - For future HTTPS with SSL

---

## 🐳 Deployment Steps

### Step 1: Connect to EC2 Server
```bash
ssh -i your-key.pem ec2-user@13.235.53.147
# or
ssh -i your-key.pem ubuntu@13.235.53.147
```

### Step 2: Navigate to Project Directory
```bash
cd /path/to/your/finance-app
```

### Step 3: Pull Latest Changes
```bash
git pull origin main
# or download the updated files
```

### Step 4: Update Backend Environment File
```bash
cd backend
cp .env.production .env
# Verify the CORS_ORIGIN includes your domains
cat .env | grep CORS_ORIGIN
```

Expected output:
```
CORS_ORIGIN=http://palbamb.com,https://palbamb.com,http://www.palbamb.com,https://www.palbamb.com,http://palbamb.in,https://palbamb.in,http://www.palbamb.in,https://www.palbamb.in,http://13.235.53.147,https://13.235.53.147
```

### Step 5: Rebuild and Deploy

#### Option A: Docker Compose (Recommended)
```bash
# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Remove old images (optional, for fresh build)
docker rmi finance-backend:latest finance-frontend:latest

# Rebuild images
cd backend
docker build -t finance-backend:latest .

cd ../frontend
docker build -t finance-frontend:latest .

# Start services
cd ..
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Option B: Manual Deployment
```bash
# Backend
cd backend
npm install
pm2 restart finance-backend || pm2 start server.js --name finance-backend

# Frontend
cd ../frontend
npm install
npm run build
# Copy build files to nginx
sudo cp -r dist/* /usr/share/nginx/html/
sudo cp nginx.conf.ec2 /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Verify Deployment
```bash
# Check backend
curl http://localhost:5001/api/health
curl http://13.235.53.147:5001/api/health

# Check frontend
curl http://localhost
curl http://13.235.53.147

# Check with domain
curl http://palbamb.com
curl http://palbamb.in
```

---

## 🧪 Testing

### 1. Test Domain Access
Open in browser:
- http://palbamb.com
- http://www.palbamb.com
- http://palbamb.in
- http://www.palbamb.in
- http://13.235.53.147

### 2. Test API Connectivity
Open browser console and test:
```javascript
fetch('http://palbamb.com/api/health')
  .then(r => r.json())
  .then(data => console.log(data));
```

### 3. Test User Authentication
- Try logging in
- Check for CORS errors in browser console
- Verify JWT tokens are set correctly

### 4. Test File Uploads
- Upload an image or document
- Verify it's stored correctly

---

## 🔒 SSL/HTTPS Setup (Recommended Next Step)

### Install Certbot (Let's Encrypt)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificates
```bash
# For both domains
sudo certbot --nginx -d palbamb.com -d www.palbamb.com -d palbamb.in -d www.palbamb.in

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (recommended)
```

### Update Nginx Configuration
After SSL is installed, use the production SSL config:
```bash
cd /path/to/finance-app/frontend
sudo cp nginx.conf.production /etc/nginx/sites-available/default
sudo nginx -t
sudo systemctl restart nginx
```

### Auto-Renewal Setup
Certbot automatically sets up renewal. Verify:
```bash
sudo certbot renew --dry-run
```

---

## 🛠️ Troubleshooting

### Issue 1: CORS Errors
**Symptom**: Browser console shows CORS errors

**Solution**:
```bash
# Check backend environment
docker exec finance-backend env | grep CORS_ORIGIN

# Restart backend
docker restart finance-backend
```

### Issue 2: Domain Not Loading
**Symptom**: Domain shows connection refused

**Solution**:
```bash
# Check nginx is running
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check if port 80 is open
sudo netstat -tlnp | grep :80
```

### Issue 3: API Calls Failing
**Symptom**: Frontend loads but API calls fail

**Solution**:
```bash
# Check backend is running
docker ps | grep backend
curl http://localhost:5001/api/health

# Check backend logs
docker logs finance-backend

# Restart backend
docker restart finance-backend
```

### Issue 4: Static Files Not Loading
**Symptom**: CSS/JS files not loading

**Solution**:
```bash
# Check nginx config
sudo nginx -t

# Verify files exist
ls -la /usr/share/nginx/html/assets/

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 Monitoring

### Check Application Status
```bash
# Docker containers
docker ps

# Container logs
docker logs -f finance-backend
docker logs -f finance-frontend

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Check Resource Usage
```bash
# CPU and Memory
docker stats

# Disk space
df -h

# Network connections
netstat -an | grep :80
netstat -an | grep :5001
```

---

## 🔄 Future Updates

### Quick Update Process
```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Rollback Process
```bash
# Stop current version
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit-hash>

# Deploy old version
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📝 Important Notes

1. **Environment Variables**: Never commit `.env` files with sensitive data
2. **Database Backups**: Setup regular MongoDB Atlas backups
3. **Monitoring**: Setup uptime monitoring (e.g., UptimeRobot)
4. **SSL Renewal**: SSL certificates auto-renew, but monitor for issues
5. **Security**: Keep all packages updated regularly

---

## 🆘 Support Contacts

- **Developer**: jay440470@gmail.com
- **Server IP**: 13.235.53.147
- **MongoDB**: Cluster0.fcxsirr.mongodb.net

---

## ✅ Post-Deployment Verification Checklist

- [ ] Both domains (palbamb.com, palbamb.in) are accessible
- [ ] WWW subdomains work correctly
- [ ] Backend API is responding
- [ ] User login/signup works
- [ ] File uploads work
- [ ] Payment gateway integration works
- [ ] No CORS errors in browser console
- [ ] All pages load correctly
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Auto-renewal configured for SSL
- [ ] Monitoring setup

---

## 🎉 Success!

Your application should now be live at:
- **Primary**: http://palbamb.com
- **Secondary**: http://palbamb.in

Next recommended step: Setup SSL/HTTPS for secure connections!
