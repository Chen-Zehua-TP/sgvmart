#!/bin/sh

# Entrypoint script for handling Certbot and nginx

set -e

# Configuration
DOMAIN="${DOMAIN:-ggvault.shop}"
EMAIL="${EMAIL:-admin@ggvault.shop}"
CERTBOT_DIR="/etc/letsencrypt/live/$DOMAIN"
RENEWAL_LOG="/var/log/certbot-renewal.log"

echo "🚀 Starting SSL certificate setup and nginx configuration..."

# Create log file
touch "$RENEWAL_LOG"

# Function to check if certificate exists
check_certificate() {
    if [ -d "$CERTBOT_DIR" ] && [ -f "$CERTBOT_DIR/fullchain.pem" ] && [ -f "$CERTBOT_DIR/privkey.pem" ]; then
        return 0
    else
        return 1
    fi
}

# Function to obtain certificate
obtain_certificate() {
    echo "📝 Obtaining SSL certificate from Let's Encrypt for $DOMAIN..."
    
    certbot certonly --webroot \
        -w /var/www/certbot \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --expand \
        --prefer-challenges http || {
        echo "❌ Certificate generation failed. Using self-signed certificate..."
        generate_selfsigned_certificate
        return 1
    }
    
    echo "✅ Certificate obtained successfully!"
    return 0
}

# Function to generate self-signed certificate (fallback)
generate_selfsigned_certificate() {
    echo "🔒 Generating self-signed certificate as fallback..."
    
    mkdir -p "$CERTBOT_DIR"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERTBOT_DIR/privkey.pem" \
        -out "$CERTBOT_DIR/fullchain.pem" \
        -subj "/C=SG/ST=Singapore/L=Singapore/O=GGVault/CN=$DOMAIN"
    
    echo "✅ Self-signed certificate created as fallback"
}

# Main logic
if check_certificate; then
    echo "✅ Valid certificate found for $DOMAIN"
else
    echo "⚠️  No valid certificate found, attempting to obtain from Let's Encrypt..."
    obtain_certificate || generate_selfsigned_certificate
fi

# Function to renew certificate
renew_certificate() {
    echo "🔄 Running certificate renewal check..."
    
    if certbot renew --quiet --webroot -w /var/www/certbot >> "$RENEWAL_LOG" 2>&1; then
        echo "✅ Certificate renewal check completed successfully"
        # Reload nginx after successful renewal
        nginx -s reload
    else
        echo "⚠️  Certificate renewal check completed with warnings (see $RENEWAL_LOG)"
    fi
}

# Start a background process to renew certificates daily
while true; do
    sleep 86400  # 24 hours
    renew_certificate
done &

# Start nginx
echo "🌐 Starting nginx..."
exec nginx -g "daemon off;"
