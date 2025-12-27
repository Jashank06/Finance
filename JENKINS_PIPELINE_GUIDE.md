# 🔄 Jenkins CI/CD Pipeline Guide for Finance App

## 📋 Overview

This Jenkins pipeline automatically builds Docker images and pushes them to Docker Hub when you commit code to your repository.

---

## 🎯 What This Pipeline Does

### Stages:

1. **Checkout** ✅
   - Pulls latest code from Git repository
   - Gets commit hash for versioning

2. **Build Backend Image** 🐳
   - Builds Docker image from `backend/Dockerfile`
   - Tags with build number + commit hash
   - Tags as `latest`

3. **Build Frontend Image** 🐳
   - Builds Docker image from `frontend/Dockerfile`
   - Tags with build number + commit hash
   - Tags as `latest`

4. **Login to Docker Hub** 🔐
   - Authenticates with Docker Hub
   - Uses credentials stored in Jenkins

5. **Push Images** 📤
   - Pushes both images to Docker Hub
   - Pushes both tags (versioned + latest)

6. **Cleanup** 🧹
   - Removes local Docker images
   - Frees up Jenkins server disk space

---

## 🔧 Jenkins Setup

### Step 1: Install Jenkins on EC2 (if not done)

```bash
# Install Java
sudo yum install java-17-amazon-corretto-headless -y

# Add Jenkins repo
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
sudo yum install jenkins -y

# Add jenkins to docker group
sudo usermod -aG docker jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 2: Access Jenkins

- URL: **http://13.235.53.147:8080**
- Paste initial password
- Install suggested plugins
- Create admin user

### Step 3: Install Required Plugins

Go to **Manage Jenkins → Plugin Manager → Available**

Install:
- ✅ **Docker Pipeline**
- ✅ **Git Plugin** (usually pre-installed)
- ✅ **Pipeline** (usually pre-installed)
- ✅ **Credentials Plugin** (usually pre-installed)

### Step 4: Add Docker Hub Credentials

1. Go to **Manage Jenkins → Credentials → System → Global credentials**
2. Click **Add Credentials**
3. Configure:
   - **Kind**: Username with password
   - **Scope**: Global
   - **Username**: `jashank06`
   - **Password**: Your Docker Hub password or access token
   - **ID**: `dockerhub` (IMPORTANT: must be exactly this)
   - **Description**: Docker Hub Credentials
4. Click **Create**

---

## 🚀 Create Jenkins Pipeline

### Step 1: Create New Pipeline Job

1. Click **New Item**
2. Enter name: `Finance-App-Pipeline`
3. Select **Pipeline**
4. Click **OK**

### Step 2: Configure Pipeline

#### General Settings:
- ☑️ **Discard old builds**: Days to keep: 7, Max # of builds: 10

#### Build Triggers:
Choose one:

**Option A: GitHub Webhook (Recommended for auto-deploy)**
- ☑️ **GitHub hook trigger for GITScm polling**
- Requires GitHub webhook setup (see below)

**Option B: Poll SCM**
- ☑️ **Poll SCM**
- Schedule: `H/5 * * * *` (check every 5 minutes)

**Option C: Manual (Build Now button)**
- Leave blank, click "Build Now" to run

#### Pipeline Configuration:

**Definition**: Pipeline script from SCM

**SCM**: Git

**Repository URL**: Your GitHub repo URL
- Example: `https://github.com/your-username/finance-app.git`

**Credentials**: 
- If public repo: None
- If private repo: Add GitHub credentials

**Branch Specifier**: `*/main` (or `*/master`)

**Script Path**: `Jenkinsfile`

### Step 3: Save and Build

Click **Save**, then click **Build Now**

---

## 🔗 Setup GitHub Webhook (Optional - Auto Deploy)

### On GitHub:

1. Go to your repository → **Settings** → **Webhooks**
2. Click **Add webhook**
3. Configure:
   - **Payload URL**: `http://13.235.53.147:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events?**: Just the push event
   - **Active**: ✅ Checked
4. Click **Add webhook**

### Test:
- Make a commit and push to GitHub
- Jenkins should automatically start a build
- Check **Console Output** for progress

---

## 📊 Pipeline Output

### Successful Build:

```
✅ Build successful! Images pushed to Docker Hub
Backend: jashank06/finance-backend:42-a1b2c3d
Frontend: jashank06/finance-frontend:42-a1b2c3d

To deploy on AWS EC2 t4g.nano (13.235.53.147), run:
docker pull jashank06/finance-backend:latest
docker pull jashank06/finance-frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

### Build Tags:
- **Versioned**: `jashank06/finance-backend:42-a1b2c3d`
  - `42` = Jenkins build number
  - `a1b2c3d` = Git commit hash (first 7 chars)
- **Latest**: `jashank06/finance-backend:latest`

---

## 🔄 Complete Workflow

### Development Workflow:

```
1. Developer commits code
   ↓
2. Push to GitHub
   ↓
3. GitHub webhook triggers Jenkins
   ↓
4. Jenkins builds Docker images
   ↓
5. Jenkins pushes to Docker Hub
   ↓
6. [Manual] SSH to EC2 and pull latest images
   ↓
7. [Manual] Restart containers
```

### Auto-Deploy (Advanced):

To make it fully automatic, add this stage to Jenkinsfile:

```groovy
stage('Deploy to EC2') {
    steps {
        script {
            sshagent(['ec2-ssh-key']) {
                sh """
                    ssh -o StrictHostKeyChecking=no ec2-user@13.235.53.147 '
                        cd ~/finance-app
                        docker pull jashank06/finance-backend:latest
                        docker pull jashank06/finance-frontend:latest
                        docker-compose -f docker-compose.prod.yml up -d
                    '
                """
            }
        }
    }
}
```

---

## 🐛 Troubleshooting

### Build Fails: "docker: command not found"

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins
```

### Build Fails: "Permission denied"

```bash
# Fix docker socket permissions
sudo chmod 666 /var/run/docker.sock

# Or restart docker
sudo systemctl restart docker
```

### Build Fails: "Cannot connect to Docker Hub"

- Verify credentials in Jenkins
- Check Docker Hub username: `jashank06`
- Credential ID must be: `dockerhub`

### Build Slow or Out of Memory

```bash
# Jenkins on t4g.nano (512MB RAM) might struggle
# Add swap space
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### GitHub Webhook Not Working

- Check Security Group allows port 8080
- Verify webhook URL: `http://13.235.53.147:8080/github-webhook/`
- Check webhook delivery in GitHub settings

---

## 📈 Monitoring

### View Build Progress:

1. Go to your pipeline job
2. Click on build number (e.g., #42)
3. Click **Console Output**
4. Watch real-time logs

### Build History:

- **Blue Ball** 🔵 = In progress
- **Green Ball** 🟢 = Success
- **Red Ball** 🔴 = Failed
- **Yellow Ball** 🟡 = Unstable

---

## 🎯 Best Practices

1. **Always test locally first**:
   ```bash
   docker build -t test-backend ./backend
   docker build -t test-frontend ./frontend
   ```

2. **Keep Dockerfiles optimized**:
   - Use multi-stage builds (already done)
   - Minimize layers
   - Use .dockerignore

3. **Monitor disk space**:
   ```bash
   df -h
   docker system df
   docker system prune -a  # Clean up
   ```

4. **Tag important builds**:
   - `latest` = Most recent
   - `stable` = Known working version
   - `v1.0.0` = Release versions

5. **Regular backups**:
   - Backup Jenkins config
   - Backup .env files
   - Backup database

---

## 🔐 Security

- ✅ Never commit credentials to Git
- ✅ Use Jenkins credential manager
- ✅ Restrict Jenkins port 8080 to your IP
- ✅ Enable CSRF protection in Jenkins
- ✅ Keep Jenkins updated
- ✅ Use SSH keys, not passwords

---

## 📞 Quick Reference

### Jenkins URLs:
- **Dashboard**: http://13.235.53.147:8080
- **Job**: http://13.235.53.147:8080/job/Finance-App-Pipeline/
- **Build #42**: http://13.235.53.147:8080/job/Finance-App-Pipeline/42/

### Docker Hub:
- **Backend**: https://hub.docker.com/r/jashank06/finance-backend
- **Frontend**: https://hub.docker.com/r/jashank06/finance-frontend

### Useful Commands:
```bash
# View Jenkins logs
sudo journalctl -u jenkins -f

# Restart Jenkins
sudo systemctl restart jenkins

# Check Jenkins status
sudo systemctl status jenkins

# View build workspace
ls /var/lib/jenkins/workspace/Finance-App-Pipeline/
```

---

**Your CI/CD pipeline is ready! Push code and watch it auto-build! 🚀**
