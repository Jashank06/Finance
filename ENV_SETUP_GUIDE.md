# 🔐 Environment Variables Setup Guide

## 📋 Overview

Your application needs environment variables for:
- **Backend**: Database, Email, Payment, Cloud Storage
- **Frontend**: API endpoints during build time

---

## 🎯 Quick Setup on EC2

### Step 1: Copy .env file to EC2

```bash
# Option A: Using SCP (from your local machine)
scp -i your-key.pem .env.production.complete ec2-user@13.235.53.147:~/finance-app/.env

# Option B: Manual copy on EC2
ssh -i your-key.pem ec2-user@13.235.53.147
cd ~/finance-app
nano .env
# Paste contents from .env.production.complete
# Save: Ctrl+X, Y, Enter
```

### Step 2: Secure the file

```bash
# Set proper permissions (only owner can read/write)
chmod 600 .env

# Verify
ls -la .env
# Should show: -rw------- 1 ec2-user ec2-user
```

### Step 3: Verify variables

```bash
# Check if all variables are set
cat .env | grep -v '^#' | grep -v '^$'

# Test if backend can read them
docker-compose exec backend printenv | grep -E 'MONGODB|JWT|EMAIL|RAZORPAY|CLOUDINARY'
```

---

## 📝 Environment Variables Breakdown

### Backend Variables (.env on EC2)

#### 🗄️ Database
```env
MONGODB_URI=mongodb+srv://jaykumar0305_db_user:jay123@cluster0.fcxsirr.mongodb.net/finance-app?retryWrites=true&w=majority&appName=Cluster0
```
- **Purpose**: Connect to MongoDB Atlas
- **Current**: Your existing cluster
- **Note**: Already configured and working

#### 🔑 Authentication
```env
JWT_SECRET=FinanceApp_Production_JWT_Secret_2024_ChangeThis_InProduction_12345
```
- **Purpose**: Sign and verify JWT tokens
- **⚠️ SECURITY**: Change this to a strong random string
- **Generate**: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

#### 📧 Email (OTP Service)
```env
EMAIL_USER=jay440470@gmail.com
EMAIL_PASS=gwrs xzii wwza rtep
```
- **Purpose**: Send OTP emails to users
- **Note**: Using Gmail with app-specific password (NOT your actual Gmail password)
- **Current**: Already configured

#### ☁️ Cloudinary (Image Upload)
```env
CLOUDINARY_CLOUD_NAME=dozazvcec
CLOUDINARY_API_KEY=979932955859291
CLOUDINARY_API_SECRET=2CytyqGhLXQpSDFdD1uoRa5tEZI
```
- **Purpose**: Store uploaded images (profile pics, documents, etc.)
- **Current**: Already configured

#### 💳 Razorpay (Payment Gateway)
```env
RAZORPAY_KEY_ID=rzp_live_Rl33gA8jKmOn6k
RAZORPAY_KEY_SECRET=S8PrnaNUUORaXtApYyYDmJrY
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```
- **Purpose**: Process payments for subscriptions
- **⚠️ IMPORTANT**: These are LIVE keys - handle with care
- **Webhook**: Update this from Razorpay dashboard

---

### Frontend Variables (Build Time)

#### 🌐 API Endpoint
```env
VITE_API_URL=http://13.235.53.147:5001/api
```
- **Purpose**: Frontend knows where to send API requests
- **Current**: Points to your EC2 backend
- **Note**: Embedded in built JavaScript during Docker build

#### 💳 Razorpay Public Key
```env
VITE_RAZORPAY_KEY_ID=rzp_live_Rl33gA8jKmOn6k
```
- **Purpose**: Initialize Razorpay checkout on frontend
- **Note**: This is PUBLIC key, safe to expose

---

## 🏗️ Build Process

### Frontend Build (Docker):
1. Dockerfile reads `frontend/.env.production`
2. Vite embeds `VITE_*` variables into JavaScript during build
3. Built files are static and served by Nginx

### Backend Runtime (Docker):
1. docker-compose.yml passes `.env` variables to container
2. Backend reads them at runtime via `process.env`

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env` file only on EC2 server
- Set permissions: `chmod 600 .env`
- Change JWT_SECRET to a strong random value
- Use app-specific password for Gmail (not real password)
- Keep Razorpay keys secure (these are LIVE keys)
- Backup `.env` file securely

### ❌ DON'T:
- Commit `.env` to Git (already in `.gitignore`)
- Share `.env` file publicly
- Use weak JWT_SECRET
- Expose backend environment variables to frontend
- Use test keys in production

---

## 🔄 Update Environment Variables

### If you need to change a variable:

```bash
# On EC2
cd ~/finance-app
nano .env
# Update the value
# Save: Ctrl+X, Y, Enter

# Restart containers to apply changes
docker-compose restart

# For frontend variables (requires rebuild):
docker-compose down
docker-compose build frontend
docker-compose up -d
```

---

## 🧪 Testing

### Test Backend Variables:
```bash
# Check if backend can connect to MongoDB
docker-compose exec backend node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Failed:', err.message));
"

# Test email (sends test OTP)
curl -X POST http://localhost:5001/api/otp/login-request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Frontend Variables:
```bash
# Check API URL in built files
docker-compose exec frontend grep -r "13.235.53.147" /usr/share/nginx/html/assets/
```

---

## 📞 Quick Reference

### Current Configuration:
- **EC2 IP**: 13.235.53.147
- **Backend Port**: 5001
- **Frontend Port**: 80
- **Database**: MongoDB Atlas (cloud)
- **Email**: Gmail with app password
- **Storage**: Cloudinary (cloud)
- **Payments**: Razorpay LIVE keys

### File Locations:
- **Production .env**: `~/finance-app/.env` (on EC2)
- **Backend template**: `backend/.env.production`
- **Frontend template**: `frontend/.env.production`
- **Complete template**: `.env.production.complete`

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Verify MongoDB URI
echo $MONGODB_URI
# Check if IP is whitelisted in MongoDB Atlas (allow 0.0.0.0/0 for testing)
```

### "OTP emails not sending"
```bash
# Verify Gmail credentials
docker-compose exec backend node -e "console.log('Email:', process.env.EMAIL_USER)"
# Check Gmail "Less secure app access" or use app-specific password
```

### "Payment gateway not working"
```bash
# Verify Razorpay keys
docker-compose exec backend node -e "console.log('Key:', process.env.RAZORPAY_KEY_ID)"
# Ensure you're using LIVE keys, not TEST keys
```

### "Frontend can't reach backend"
```bash
# Check VITE_API_URL
docker-compose exec frontend cat /usr/share/nginx/html/assets/*.js | grep "13.235.53.147"
# Should show your EC2 IP
```

---

## 🎯 Pre-Deployment Checklist

- [ ] `.env` file created on EC2
- [ ] All variables have correct values
- [ ] JWT_SECRET changed to strong random string
- [ ] File permissions set to 600
- [ ] MongoDB Atlas IP whitelist includes EC2 IP (or 0.0.0.0/0)
- [ ] Gmail app-specific password working
- [ ] Razorpay LIVE keys configured
- [ ] Cloudinary credentials correct
- [ ] Frontend VITE_API_URL points to EC2 IP
- [ ] Containers can read variables
- [ ] Test login works
- [ ] Test payment works
- [ ] Test image upload works

---

**Your environment is now ready for production! 🚀**
