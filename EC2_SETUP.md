# AWS EC2 t4g.nano Setup Guide for Finance App

## 📋 Prerequisites

- AWS Account with EC2 access
- Domain name (optional, for production)
- Docker Hub account
- GitHub repository with your code

## 🚀 Step 1: Launch EC2 Instance

### Instance Configuration:
- **Instance Type**: t4g.nano (ARM64 architecture)
- **AMI**: Amazon Linux 2023 (ARM64)
- **Storage**: 20 GB gp3 (minimum recommended)
- **Security Group Rules**:
  - SSH (22) - Your IP only
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0 (for SSL later)
  - Custom TCP (5001) - 0.0.0.0/0 (Backend API)
  - Custom TCP (8080) - Your IP only (Jenkins)

### Launch Steps:
```bash
# 1. Go to AWS EC2 Console
# 2. Click "Launch Instance"
# 3. Select Amazon Linux 2023 (ARM64)
# 4. Choose t4g.nano
# 5. Create/Select Key Pair (download .pem file)
# 6. Configure Security Group as above
# 7. Launch Instance
```

## 🔧 Step 2: Connect to EC2 Instance

```bash
# Change key permissions
chmod 400 your-key.pem

# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-public-ip
```

## 📦 Step 3: Install Docker & Docker Compose

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group
sudo usermod -aG docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes to take effect
exit
# Then reconnect via SSH
```

## 📂 Step 4: Setup Application

```bash
# Create application directory
mkdir -p ~/finance-app
cd ~/finance-app

# Clone your repository
git clone https://github.com/your-username/your-repo.git .

# Create .env file
nano .env
# Copy contents from .env.example and update with your values

# Make deploy script executable
chmod +x deploy.sh
```

## 🐳 Step 5: Deploy Application

```bash
# Run deployment script
./deploy.sh

# Or manually with docker-compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Check container status
docker-compose ps
```

## 🔍 Step 6: Verify Deployment

```bash
# Check backend health
curl http://localhost:5001/api/health

# Check frontend
curl http://localhost:80

# If both return successfully, your app is running!
```

## 🌐 Step 7: Access Your Application

- **Frontend**: http://your-ec2-public-ip
- **Backend API**: http://your-ec2-public-ip:5001/api

## 🔄 Step 8: Setup Jenkins for CI/CD (Optional)

### Install Jenkins:

```bash
# Install Java (required for Jenkins)
sudo yum install java-17-amazon-corretto-headless -y

# Add Jenkins repo
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
sudo yum install jenkins -y

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Access Jenkins:
- URL: `http://your-ec2-public-ip:8080`
- Enter initial admin password
- Install suggested plugins
- Create admin user

### Configure Jenkins:

1. **Install Plugins**:
   - Docker Pipeline
   - Git Plugin
   - SSH Agent
   - Credentials Plugin

2. **Add Credentials**:
   - Docker Hub credentials (ID: `docker-hub-credentials`)
   - EC2 SSH key (ID: `ec2-ssh-key`)

3. **Create Pipeline**:
   - New Item → Pipeline
   - Pipeline → Pipeline script from SCM
   - SCM: Git
   - Repository URL: Your GitHub repo
   - Script Path: `Jenkinsfile`

4. **Update Jenkinsfile**:
   - Replace `your-dockerhub-username` with your Docker Hub username
   - Replace `your-ec2-public-ip` with your EC2 public IP

5. **Trigger Build**:
   - Click "Build Now"
   - Jenkins will automatically build and deploy

## 🔒 Step 9: Setup SSL (Optional but Recommended)

### Using Let's Encrypt (Free SSL):

```bash
# Install Nginx
sudo yum install nginx -y

# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update docker-compose.yml to expose ports 443
# Restart containers
docker-compose down && docker-compose up -d
```

## 📊 Monitoring & Maintenance

### View Logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart Services:
```bash
docker-compose restart
```

### Update Application:
```bash
cd ~/finance-app
git pull origin main
./deploy.sh
```

### Clean Up Docker:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused containers
docker container prune
```

## 🛡️ Security Best Practices

1. **Restrict SSH access** to your IP only
2. **Use environment variables** for sensitive data
3. **Enable CloudWatch** for monitoring
4. **Setup automated backups** for MongoDB
5. **Use AWS Secrets Manager** for production secrets
6. **Enable EC2 Instance Connect** for secure access
7. **Setup AWS CloudWatch Alarms** for resource monitoring

## 💾 Backup Strategy

### Database Backup:
```bash
# Create backup script
nano ~/backup.sh

# Add this content:
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR

# Backup MongoDB (if self-hosted)
# mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/backup_$TIMESTAMP

# Backup uploads directory
docker cp finance-backend:/app/uploads $BACKUP_DIR/uploads_$TIMESTAMP

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR s3://your-backup-bucket/ --recursive

echo "Backup completed: $TIMESTAMP"

# Make executable
chmod +x ~/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * ~/backup.sh >> ~/backup.log 2>&1
```

## 🔥 Troubleshooting

### Container not starting:
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Out of memory (t4g.nano has 512MB RAM):
```bash
# Check memory usage
free -h

# Add swap space
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Port already in use:
```bash
# Check what's using the port
sudo lsof -i :80
sudo lsof -i :5001

# Kill process if needed
sudo kill -9 <PID>
```

## 📈 Scaling Considerations

For t4g.nano limitations:
- Use MongoDB Atlas (cloud) instead of self-hosted
- Enable gzip compression in Nginx
- Minimize Docker image sizes
- Use Docker build cache effectively
- Consider upgrading to t4g.small for better performance

## 📞 Support

If you encounter issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables in `.env`
3. Ensure Security Group rules are correct
4. Check EC2 instance status in AWS Console

---

**Good Luck with Your Deployment! 🚀**
