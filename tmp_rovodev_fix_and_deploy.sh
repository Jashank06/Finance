#!/bin/bash
# Quick fix and deploy script

echo "🔧 Fixing Vite base path issue..."
echo "✅ vite.config.js updated (base: '/' instead of '/Finance/')"
echo ""
echo "📦 Now rebuilding and deploying..."
echo ""

cd frontend

# Rebuild Docker image
echo "🏗️  Building new frontend Docker image..."
docker build -t jashank06/finance-frontend:latest .

if [ $? -eq 0 ]; then
    echo "✅ Docker image built successfully!"
    echo ""
    
    # Push to Docker Hub
    echo "📤 Pushing to Docker Hub..."
    docker push jashank06/finance-frontend:latest
    
    if [ $? -eq 0 ]; then
        echo "✅ Pushed to Docker Hub!"
        echo ""
        
        # Restart container
        echo "🔄 Restarting frontend container..."
        cd ..
        docker-compose -f docker-compose.prod.yml pull frontend
        docker-compose -f docker-compose.prod.yml up -d frontend
        
        echo ""
        echo "✅ DEPLOYMENT COMPLETE!"
        echo ""
        echo "🌐 Test your app at: http://13.235.53.147/"
        echo ""
        echo "Check logs with: docker logs finance-frontend"
    else
        echo "❌ Failed to push to Docker Hub"
        exit 1
    fi
else
    echo "❌ Docker build failed"
    exit 1
fi
