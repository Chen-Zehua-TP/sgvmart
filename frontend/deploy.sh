#!/bin/bash

# Stop and remove all containers
echo "Stopping and removing containers..."
docker-compose down

# Remove dangling containers and images
echo "Cleaning up Docker..."
docker container prune -f
docker image prune -f

# Rebuild and start fresh
echo "Building and starting services..."
docker-compose up -d --build --force-recreate

echo "Done! Check status with: docker-compose ps"
