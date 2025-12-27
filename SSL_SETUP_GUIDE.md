# 🔒 SSL/TLS Setup Guide for Production

## Overview
This guide helps you secure your Finance App with HTTPS using SSL/TLS certificates.

---

## Option 1: Let's Encrypt (FREE - Recommended)

### Prerequisites
- Domain name pointing to your EC2 IP
- Ports 80 and 443 open in AWS Security Group

### Steps

#### 1. Install Certbot on EC2
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

#### 2. Stop Running Containers (if any)
```bash
cd ~/finance-app
docker-compose -f docker-compose.prod.yml down
```

#### 3. Get SSL Certificate
```bash
# Replace your-domain.com with your actual domain
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Follow the prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to share email
```

#### 4. Copy Certificates to Project
```bash
# Create SSL directory in your project
mkdir -p ~/finance-app/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ~/finance-app/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ~/finance-app/ssl/

# Set proper permissions
sudo chown $USER:$USER ~/finance-app/ssl/*.pem
chmod 644 ~/finance-app/ssl/fullchain.pem
chmod 600 ~/finance-app/ssl/privkey.pem
```

#### 5. Update Nginx Configuration
```bash
cd ~/finance-app/frontend

# Backup current config
cp nginx.conf nginx.conf.backup

# Copy production config
cp nginx.conf.production nginx.conf

# Edit the nginx.conf and replace:
# - your-domain.com with your actual domain
nano nginx.conf
```

#### 6. Update Environment Variables
```bash
# Edit .env file
nano ~/finance-app/.env

# Update these values:
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
FRONTEND_URL=https://your-domain.com

# For frontend build (if rebuilding):
VITE_API_URL=https://your-domain.com/api
```

#### 7. Deploy with Secure Configuration
```bash
cd ~/finance-app

# Use the secure docker-compose file
docker-compose -f docker-compose.prod-secure.yml up -d

# Check logs
docker-compose -f docker-compose.prod-secure.yml logs -f
```

#### 8. Setup Auto-Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Certbot automatically sets up cron job for renewal
# Verify cron job
sudo systemctl status certbot.timer
```

#### 9. Create Renewal Hook (Optional)
```bash
# Create hook script to restart containers after renewal
sudo nano /etc/letsencrypt/renewal-hooks/deploy/restart-docker.sh

# Add this content:
#!/bin/bash
cd /home/ubuntu/finance-app
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
chown ubuntu:ubuntu ssl/*.pem
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem
docker-compose -f docker-compose.prod-secure.yml restart frontend

# Make it executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/restart-docker.sh
```

---

## Option 2: Self-Signed Certificate (FOR TESTING ONLY)

⚠️ **Warning**: Self-signed certificates show browser warnings. Use only for testing!

### Generate Self-Signed Certificate
```bash
cd ~/finance-app
mkdir -p ssl

# Generate certificate (valid for 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/privkey.pem \
  -out ssl/fullchain.pem \
  -subj "/C=IN/ST=State/L=City/O=Organization/CN=your-domain.com"

# Set permissions
chmod 644 ssl/fullchain.pem
chmod 600 ssl/privkey.pem
```

---

## Option 3: AWS Certificate Manager (ACM)

If using Application Load Balancer:

### Steps
1. **Request Certificate in ACM**
   - Go to AWS Certificate Manager
   - Request a public certificate
   - Add domain names
   - Validate via DNS or Email

2. **Setup Application Load Balancer**
   ```bash
   # Create ALB in AWS Console
   # - Listener on port 443 with ACM certificate
   # - Target group pointing to EC2 instance port 80
   # - Forward HTTP (80) to HTTPS (443)
   ```

3. **Update Security Groups**
   ```bash
   # EC2 Security Group:
   # - Allow port 80 from ALB security group only
   # - Allow port 5001 from ALB security group only
   
   # ALB Security Group:
   # - Allow port 443 from 0.0.0.0/0
   # - Allow port 80 from 0.0.0.0/0 (for redirect)
   ```

4. **Use Standard Docker Compose**
   ```bash
   # No need for SSL in nginx.conf
   # ALB handles SSL termination
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## Verification Steps

### 1. Check SSL Certificate
```bash
# Using OpenSSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Check certificate expiry
openssl s_client -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 2. Test HTTPS
```bash
# Should return 200 OK
curl -I https://your-domain.com

# Should redirect to HTTPS
curl -I http://your-domain.com
```

### 3. Online SSL Checkers
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [WhyNoPadlock](https://www.whynopadlock.com/)

### 4. Check Security Headers
```bash
curl -I https://your-domain.com
```

---

## Troubleshooting

### Certificate Not Found
```bash
# Check if certificates exist
ls -la ~/finance-app/ssl/

# Check permissions
ls -la ~/finance-app/ssl/*.pem

# Check Docker volume mount
docker-compose -f docker-compose.prod-secure.yml config
```

### Nginx Not Starting
```bash
# Check nginx logs
docker logs finance-frontend

# Test nginx configuration
docker exec finance-frontend nginx -t
```

### Port 443 Already in Use
```bash
# Check what's using port 443
sudo netstat -tulpn | grep 443

# Stop conflicting service
sudo systemctl stop apache2  # or other service
```

### Certificate Renewal Failed
```bash
# Check certbot logs
sudo journalctl -u certbot.timer

# Manually renew
sudo certbot renew --force-renewal

# Copy new certificates
sudo cp /etc/letsencrypt/live/your-domain.com/* ~/finance-app/ssl/
```

---

## Security Best Practices

### 1. Keep Certificates Secure
```bash
# Proper permissions
chmod 600 ~/finance-app/ssl/privkey.pem
chmod 644 ~/finance-app/ssl/fullchain.pem

# Never commit to Git
echo "ssl/" >> .gitignore
```

### 2. Regular Updates
```bash
# Update Docker images
docker-compose -f docker-compose.prod-secure.yml pull
docker-compose -f docker-compose.prod-secure.yml up -d

# Update system
sudo apt update && sudo apt upgrade -y
```

### 3. Monitor Certificate Expiry
```bash
# Add to crontab
crontab -e

# Add this line to check daily
0 2 * * * /usr/bin/certbot renew --quiet
```

### 4. Backup Certificates
```bash
# Backup to S3 (recommended)
aws s3 cp /etc/letsencrypt/live/your-domain.com/ \
  s3://your-backup-bucket/ssl-certificates/$(date +%Y%m%d)/ \
  --recursive

# Or local backup
sudo tar -czf ~/ssl-backup-$(date +%Y%m%d).tar.gz \
  /etc/letsencrypt/
```

---

## Cost Comparison

| Option | Cost | Pros | Cons |
|--------|------|------|------|
| **Let's Encrypt** | FREE | Auto-renewal, trusted | 90-day validity |
| **AWS ACM** | FREE (with ALB) | Auto-renewal, AWS integrated | Requires ALB ($16-18/month) |
| **Commercial SSL** | $10-200/year | Long validity, support | Manual renewal, cost |

---

## Quick Start Commands

```bash
# Complete setup in one go (Let's Encrypt)
sudo apt install certbot -y
sudo certbot certonly --standalone -d your-domain.com
mkdir -p ~/finance-app/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/*.pem ~/finance-app/ssl/
sudo chown $USER:$USER ~/finance-app/ssl/*.pem
cd ~/finance-app
docker-compose -f docker-compose.prod-secure.yml up -d
```

---

## Support

For issues:
1. Check Docker logs: `docker logs finance-frontend`
2. Check Nginx config: `docker exec finance-frontend nginx -t`
3. Verify SSL: `openssl s_client -connect your-domain.com:443`

---

**Remember**: SSL/TLS is essential for production. Never run production without HTTPS!
