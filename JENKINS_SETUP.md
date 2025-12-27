# Jenkins CI/CD Setup Guide

## 🔧 Jenkins Installation on EC2

### Step 1: Install Java
```bash
# Java is required for Jenkins
sudo yum install java-17-amazon-corretto-headless -y

# Verify installation
java -version
```

### Step 2: Install Jenkins
```bash
# Add Jenkins repository
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
sudo yum install jenkins -y

# Start Jenkins service
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Check status
sudo systemctl status jenkins
```

### Step 3: Initial Setup
```bash
# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword

# Copy the password and open Jenkins in browser
# URL: http://your-ec2-public-ip:8080
```

### Step 4: Jenkins Configuration

1. **Install Suggested Plugins**
2. **Create Admin User**
3. **Set Jenkins URL**: `http://your-ec2-public-ip:8080`

## 🔌 Required Jenkins Plugins

Install these plugins from **Manage Jenkins → Plugin Manager**:

1. **Docker Pipeline** - For Docker build/push
2. **Git Plugin** - For Git integration
3. **SSH Agent** - For SSH deployment
4. **Credentials Plugin** - For storing secrets
5. **Pipeline** - For pipeline support
6. **Blue Ocean** (Optional) - Better UI for pipelines

## 🔑 Configure Credentials

Go to **Manage Jenkins → Credentials → System → Global credentials**

### 1. Docker Hub Credentials
- **Kind**: Username with password
- **ID**: `docker-hub-credentials`
- **Username**: Your Docker Hub username
- **Password**: Your Docker Hub password or access token

### 2. EC2 SSH Key
- **Kind**: SSH Username with private key
- **ID**: `ec2-ssh-key`
- **Username**: `ec2-user`
- **Private Key**: Paste your EC2 .pem file content

### 3. GitHub Credentials (if private repo)
- **Kind**: Username with password
- **ID**: `github-credentials`
- **Username**: Your GitHub username
- **Password**: GitHub Personal Access Token

## 📋 Create Jenkins Pipeline

### Step 1: Create New Pipeline Job

1. Click **New Item**
2. Enter name: `Finance-App-Deploy`
3. Select **Pipeline**
4. Click **OK**

### Step 2: Configure Pipeline

#### General Settings:
- ☑️ **GitHub project**: Enter your GitHub repo URL
- ☑️ **Discard old builds**: Keep last 10 builds

#### Build Triggers:
- ☑️ **GitHub hook trigger for GITScm polling** (for auto-deploy on push)
- OR ☑️ **Poll SCM**: `H/5 * * * *` (check every 5 minutes)

#### Pipeline Configuration:
- **Definition**: Pipeline script from SCM
- **SCM**: Git
- **Repository URL**: Your GitHub repo URL
- **Credentials**: Select GitHub credentials (if private)
- **Branch**: `*/main` or `*/master`
- **Script Path**: `Jenkinsfile`

### Step 3: Update Jenkinsfile

Edit the `Jenkinsfile` in your repository:

```groovy
environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
    IMAGE_TAG = "${env.BUILD_NUMBER}"
    BACKEND_IMAGE = "your-dockerhub-username/finance-backend"  // ← Change this
    FRONTEND_IMAGE = "your-dockerhub-username/finance-frontend"  // ← Change this
    EC2_HOST = "your-ec2-public-ip"  // ← Change this
    EC2_USER = "ec2-user"
    EC2_SSH_KEY = credentials('ec2-ssh-key')
}
```

## 🔄 Setup GitHub Webhook (Auto Deploy)

### On GitHub:

1. Go to your repository → **Settings** → **Webhooks**
2. Click **Add webhook**
3. **Payload URL**: `http://your-ec2-public-ip:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Select "Just the push event"
6. Click **Add webhook**

### Test Webhook:
- Make a commit and push to GitHub
- Jenkins should automatically trigger a build

## 🚀 Run First Build

1. Go to your pipeline job
2. Click **Build Now**
3. View build progress in **Console Output**

### Build Stages:
1. ✅ Checkout code from Git
2. ✅ Build Backend Docker image
3. ✅ Build Frontend Docker image
4. ✅ Push images to Docker Hub
5. ✅ Deploy to EC2 via SSH
6. ✅ Run health checks

## 📊 Monitor Builds

### View Build History:
- **Build History**: Shows all builds with status
- **Blue Ocean**: Visual pipeline view
- **Console Output**: Detailed logs

### Build Status:
- 🟢 **Success**: All stages passed
- 🔴 **Failure**: One or more stages failed
- 🟡 **Unstable**: Build succeeded but has warnings

## 🐛 Troubleshooting

### Common Issues:

#### 1. Docker Command Not Found
```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### 2. SSH Connection Failed
```bash
# Test SSH connection manually
ssh -i /path/to/key.pem ec2-user@your-ec2-ip

# Verify SSH key format in Jenkins credentials
# Key should be in PEM format
```

#### 3. Docker Build Failed
```bash
# Check Dockerfile syntax
# Verify base images are available
# Check build logs in Jenkins console
```

#### 4. Permission Denied
```bash
# On EC2, ensure proper permissions
sudo chown -R ec2-user:ec2-user ~/finance-app
chmod -R 755 ~/finance-app
```

## 🔔 Setup Notifications (Optional)

### Email Notifications:

1. **Manage Jenkins → Configure System → E-mail Notification**
2. Configure SMTP server
3. Add email notification to Jenkinsfile:

```groovy
post {
    success {
        emailext (
            subject: "✅ Build Success: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "Build succeeded! Check details: ${env.BUILD_URL}",
            to: "your-email@example.com"
        )
    }
    failure {
        emailext (
            subject: "❌ Build Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "Build failed! Check logs: ${env.BUILD_URL}console",
            to: "your-email@example.com"
        )
    }
}
```

### Slack Notifications:

1. Install **Slack Notification Plugin**
2. Configure Slack webhook in Jenkins
3. Add to Jenkinsfile:

```groovy
post {
    success {
        slackSend (
            color: 'good',
            message: "✅ Deployment successful: ${env.JOB_NAME} - ${env.BUILD_NUMBER}"
        )
    }
}
```

## 🔒 Security Best Practices

1. **Restrict Jenkins access**: Use authentication and authorization
2. **Use credentials manager**: Never hardcode secrets
3. **Regular updates**: Keep Jenkins and plugins updated
4. **Audit logs**: Monitor build activities
5. **Limit SSH access**: Only from Jenkins server
6. **Use HTTPS**: Setup SSL for Jenkins UI

## 📈 Advanced Features

### Parameterized Builds:
Add parameters to manually trigger builds with options:

```groovy
parameters {
    choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'production'], description: 'Deployment environment')
    booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip test execution')
}
```

### Parallel Stages:
Build frontend and backend in parallel:

```groovy
stage('Build Images') {
    parallel {
        stage('Backend') {
            steps {
                // Build backend
            }
        }
        stage('Frontend') {
            steps {
                // Build frontend
            }
        }
    }
}
```

### Rollback Strategy:
Add rollback capability:

```groovy
post {
    failure {
        script {
            sh """
                ssh -i ${EC2_SSH_KEY} ${EC2_USER}@${EC2_HOST} '
                    cd /home/ec2-user/finance-app
                    docker-compose down
                    docker pull ${BACKEND_IMAGE}:stable
                    docker pull ${FRONTEND_IMAGE}:stable
                    docker-compose up -d
                '
            """
        }
    }
}
```

## 🎯 Pipeline Best Practices

1. **Use stages**: Organize pipeline into logical stages
2. **Add health checks**: Verify deployment success
3. **Clean workspace**: Remove build artifacts
4. **Tag images**: Use build numbers for versioning
5. **Implement rollback**: Plan for failure scenarios
6. **Monitor resources**: Track EC2 resource usage

## 📝 Maintenance

### Regular Tasks:
- Clean up old Docker images on EC2
- Monitor disk space usage
- Review build logs for errors
- Update Jenkins and plugins
- Rotate credentials periodically

### Cleanup Script:
```bash
# Add to EC2 cron job
0 3 * * * docker system prune -af --filter "until=72h"
```

---

**Your CI/CD pipeline is now ready! 🚀**

Every push to your GitHub repository will automatically:
1. Build new Docker images
2. Push to Docker Hub
3. Deploy to EC2
4. Run health checks
