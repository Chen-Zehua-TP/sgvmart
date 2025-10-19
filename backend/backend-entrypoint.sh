#!/bin/sh

set -e

DOMAIN="${DOMAIN:-ggvault.shop}"
EMAIL="${EMAIL:-admin@ggvault.shop}"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"

echo "🔒 Backend SSL Certificate Setup"
echo "=================================="

# Check if certificate exists
if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    echo "✅ SSL certificate found for $DOMAIN"
    echo "🔒 HTTPS will be enabled"
else
    echo "⚠️  SSL certificate not found at $CERT_DIR"
    echo "📝 Backend will run on HTTP"
fi

echo ""
echo "🚀 Starting backend service..."
echo ""

# Execute the original command
exec "$@"
