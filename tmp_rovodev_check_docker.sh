#!/bin/bash
echo "=== Checking which Docker Compose file you're using ==="
echo ""
echo "Current docker-compose files:"
ls -la docker-compose*.yml
echo ""
echo "=== Check if you're using the secure version ==="
grep -l "nginx.conf.production" docker-compose*.yml
