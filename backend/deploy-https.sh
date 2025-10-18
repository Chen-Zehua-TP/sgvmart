#!/bin/bash

# Backend HTTPS Setup Script
# This script helps deploy the backend with HTTPS support

set -e

echo "🔒 SGVMart Backend HTTPS Setup"
echo "================================"

# Check if running as root for Let's Encrypt
if [ "$1" == "production" ]; then
    echo "📋 Production mode selected"
    echo ""
    
    # Prompt for domain
    read -p "Enter your backend domain (e.g., api.yourdomain.com): " DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        echo "❌ Domain is required for production setup"
        exit 1
    fi
    
    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot
    fi
    
    # Stop existing containers to free port 80
    echo "🛑 Stopping existing containers..."
    docker-compose down || true
    
    # Generate Let's Encrypt certificate
    echo "🔐 Generating Let's Encrypt certificate for $DOMAIN..."
    sudo certbot certonly --standalone -d $DOMAIN
    
    if [ $? -ne 0 ]; then
        echo "❌ Certificate generation failed"
        exit 1
    fi
    
    # Update docker-compose.yml to mount certificates
    echo "📝 Updating docker-compose.yml..."
    
    # Backup original file
    cp docker-compose.yml docker-compose.yml.backup
    
    # Add volume mounts for SSL certificates
    if ! grep -q "/etc/letsencrypt" docker-compose.yml; then
        # Add volumes to nginx service
        sed -i "/nginx:/,/restart: unless-stopped/s|restart: unless-stopped|volumes:\n      - /etc/letsencrypt/live/$DOMAIN/fullchain.pem:/etc/nginx/ssl/cert.pem:ro\n      - /etc/letsencrypt/live/$DOMAIN/privkey.pem:/etc/nginx/ssl/key.pem:ro\n    restart: unless-stopped|" docker-compose.yml
    fi
    
    # Update nginx.conf with domain
    echo "📝 Updating nginx.conf with domain..."
    cp nginx.conf nginx.conf.backup
    sed -i "s/server_name localhost;/server_name $DOMAIN;/" nginx.conf
    
    # Set up auto-renewal
    echo "⚙️  Setting up certificate auto-renewal..."
    CRON_CMD="0 0,12 * * * certbot renew --quiet && cd $(pwd) && docker-compose restart nginx"
    (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | crontab -
    
    echo "✅ Production setup complete!"
    echo ""
    echo "📌 Next steps:"
    echo "   1. Update CORS_ORIGIN in .env to match your frontend domain"
    echo "   2. Update JWT_SECRET in .env with a secure value"
    echo "   3. Configure DNS to point $DOMAIN to this server"
    echo "   4. Start services: docker-compose up -d"
    
else
    echo "📋 Development mode (self-signed certificate)"
    echo ""
    echo "🚀 Starting services with self-signed SSL certificate..."
    
    # Build and start services
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Backend is now running with HTTPS!"
        echo ""
        echo "📡 Access URLs:"
        echo "   - HTTPS: https://localhost"
        echo "   - HTTP: http://localhost (redirects to HTTPS)"
        echo ""
        echo "🧪 Test commands:"
        echo "   curl -k https://localhost/health"
        echo "   curl -k https://localhost/api/products"
        echo ""
        echo "⚠️  Browser will show security warning (normal for self-signed cert)"
        echo ""
        echo "📚 For production setup with real SSL certificate:"
        echo "   ./deploy-https.sh production"
    else
        echo "❌ Failed to start services"
        exit 1
    fi
fi

echo ""
echo "📖 See SSL_SETUP.md for detailed documentation"
