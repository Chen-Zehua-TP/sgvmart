#!/bin/sh

set -e

# Configuration
DOMAIN="${DOMAIN:-ggvault.shop}"
EMAIL="${EMAIL:-admin@ggvault.shop}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
RENEWAL_LOG="/var/log/certbot-renewal.log"

echo "🚀 Starting Backend SSL certificate setup..."

# Create log file
touch "$RENEWAL_LOG"

# Function to check if certificate exists
check_certificate() {
    if [ -d "$CERT_DIR" ] && [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
        return 0
    else
        return 1
    fi
}

# Function to obtain certificate using standalone mode (for backend)
obtain_certificate() {
    echo "📝 Obtaining SSL certificate from Let's Encrypt for $DOMAIN..."
    
    # First, try using standalone method
    certbot certonly --standalone \
        -d "$DOMAIN" \
        -d "api.$DOMAIN" \
        --email "$EMAIL" \
        --agree-tos \
        --non-interactive \
        --preferred-challenges http || {
        
        # If standalone fails, try webroot as fallback
        echo "⚠️  Standalone method failed, trying webroot method..."
        certbot certonly --webroot \
            -w /var/www/certbot \
            -d "$DOMAIN" \
            -d "api.$DOMAIN" \
            --email "$EMAIL" \
            --agree-tos \
            --non-interactive \
            --expand || {
            
            echo "❌ Certificate generation failed. Using self-signed certificate..."
            generate_selfsigned_certificate
            return 1
        }
    }
    
    echo "✅ Certificate obtained successfully!"
    return 0
}

# Function to generate self-signed certificate (fallback)
generate_selfsigned_certificate() {
    echo "🔒 Generating self-signed certificate as fallback..."
    
    mkdir -p "$CERT_DIR"
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
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
    
    if certbot renew --quiet >> "$RENEWAL_LOG" 2>&1; then
        echo "✅ Certificate renewal check completed successfully"
    else
        echo "⚠️  Certificate renewal check completed with warnings (see $RENEWAL_LOG)"
    fi
}

# Start a background process to renew certificates daily
while true; do
    sleep 86400  # 24 hours
    renew_certificate
done &

# Start the application
echo "🚀 Starting Node.js backend server..."
exec "$@"
