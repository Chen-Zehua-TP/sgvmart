# SSL/HTTPS Configuration

## Development (Self-Signed Certificate)
The Dockerfile automatically generates a self-signed SSL certificate for development/testing.
- Access via: https://localhost (you'll see a browser security warning - this is normal)
- HTTP (port 80) automatically redirects to HTTPS (port 443)

## Production (Real SSL Certificate)

### Option 1: Let's Encrypt (Free)
For production, replace the self-signed certificate with a real one from Let's Encrypt.

#### On Your Server:
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Generate certificate (stop nginx first)
docker-compose down
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

#### Update docker-compose.yml:
```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  ports:
    - "80:80"
    - "443:443"
  volumes:
    # Mount real SSL certificates
    - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/nginx/ssl/cert.pem:ro
    - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/nginx/ssl/key.pem:ro
  environment:
    - NODE_ENV=production
  restart: unless-stopped
```

### Option 2: Manual Certificate Upload
If you have SSL certificates from a provider:

1. Copy your certificates to the server
2. Mount them in docker-compose.yml:
```yaml
volumes:
  - ./ssl/certificate.crt:/etc/nginx/ssl/cert.pem:ro
  - ./ssl/private.key:/etc/nginx/ssl/key.pem:ro
```

### Option 3: Oracle Cloud Load Balancer
Use Oracle Cloud's load balancer for SSL termination:
- Configure SSL at the load balancer level
- Load balancer handles HTTPS (443)
- Routes to container on HTTP (80)
- Remove SSL configuration from nginx

## Certificate Renewal
Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Add to crontab
sudo crontab -e

# Add this line (checks twice daily)
0 0,12 * * * certbot renew --quiet && docker-compose restart frontend
```

## Security Notes
- Never commit SSL private keys to version control
- Use environment variables or mounted volumes for certificates
- Enable HSTS (already configured in nginx.conf)
- Consider using a CDN like CloudFlare for additional security
