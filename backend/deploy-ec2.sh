#!/bin/bash

# AWS EC2 Backend Deployment Script
# Run this on your EC2 instance

set -e

echo "🚀 Deploying SGVMart Backend to AWS EC2"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed${NC}"
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    sudo apt-get update
    sudo apt-get install -y docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
fi

# Stop existing containers
echo -e "${BLUE}Stopping existing containers...${NC}"
docker-compose down || true

# Build and start services
echo -e "${BLUE}Building and starting services...${NC}"
docker-compose up -d --build

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${BLUE}Service Status:${NC}"
docker-compose ps

# Test backend health
echo ""
echo -e "${BLUE}Testing backend health...${NC}"
sleep 5

if curl -k -s https://localhost/health > /dev/null; then
    echo -e "${GREEN}✓ Backend is healthy!${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check failed. Checking logs...${NC}"
    docker-compose logs --tail=50 backend
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Access URLs:${NC}"
echo "  - HTTPS: https://47.129.244.221"
echo "  - Health: https://47.129.244.221/health"
echo "  - API: https://47.129.244.221/api"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart: docker-compose restart"
echo "  - Stop: docker-compose down"
echo "  - Check status: docker-compose ps"
echo ""
echo -e "${YELLOW}Note: Update CORS_ORIGIN in .env if needed${NC}"
