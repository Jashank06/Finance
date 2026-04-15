pipeline {
    agent any
    
    environment {
        // Docker Hub credentials (Configure in Jenkins: Manage Jenkins > Credentials)
        // Add credentials with ID 'dockerhub' (username + password)
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        DOCKERHUB_USERNAME = 'jashank06'
        
        // Image names
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/finance-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/finance-frontend"
        
        // Build tag (timestamp + commit hash)
        BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'latest'}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                }
            }
        }
        
        stage('Build Backend Image') {
            steps {
                script {
                    echo "Building Backend Docker Image: ${BACKEND_IMAGE}:${BUILD_TAG}"
                    dir('backend') {
                        sh """
                            docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} .
                            docker tag ${BACKEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Build Frontend Image') {
            steps {
                script {
                    echo "Building Frontend Docker Image: ${FRONTEND_IMAGE}:${BUILD_TAG}"
                    dir('frontend') {
                        sh """
                            docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} .
                            docker tag ${FRONTEND_IMAGE}:${BUILD_TAG} ${FRONTEND_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Login to Docker Hub') {
            steps {
                script {
                    echo 'Logging into Docker Hub...'
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                }
            }
        }
        
        stage('Push Images to Docker Hub') {
            steps {
                script {
                    echo 'Pushing Backend image to Docker Hub...'
                    sh """
                        docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                    """
                    
                    echo 'Pushing Frontend image to Docker Hub...'
                    sh """
                        docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Cleanup Local Images') {
            steps {
                script {
                    echo 'Cleaning up local Docker images...'
                    sh """
                        docker rmi ${BACKEND_IMAGE}:${BUILD_TAG} || true
                        docker rmi ${FRONTEND_IMAGE}:${BUILD_TAG} || true
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Build successful! Images pushed to Docker Hub"
            echo "Backend: ${BACKEND_IMAGE}:${BUILD_TAG}"
            echo "Frontend: ${FRONTEND_IMAGE}:${BUILD_TAG}"
            echo ""
            echo "To deploy on AWS EC2 t4g.nano (13.235.53.147), run:"
            echo "docker pull ${BACKEND_IMAGE}:latest"
            echo "docker pull ${FRONTEND_IMAGE}:latest"
            echo "docker-compose -f docker-compose.prod.yml up -d"
        }
        failure {
            echo '❌ Build failed!'
        }
        always {
            script {
                try {
                    // Logout from Docker Hub
                    sh 'docker logout || true'
                    
                    // Clean up dangling images
                    sh 'docker image prune -f || true'
                } catch (Exception e) {
                    echo "Cleanup failed: ${e.message}"
                }
            }
        }
    }
}
