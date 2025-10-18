# Backend SSL/HTTPS Configuration

## Overview
The backend now uses Nginx as a reverse proxy with SSL termination. This setup:
- Handles HTTPS connections (port 443)
- Redirects HTTP (port 80) to HTTPS
- Proxies requests to the backend Node.js application (port 3000)
- Provides security headers and SSL configuration

## Architecture
```
Internet → Nginx (ports 80/443) → Backend App (port 3000) → PostgreSQL (port 5432)
```

## Development (Self-Signed Certificate)

The `Dockerfile.nginx` automatically generates a self-signed SSL certificate for development/testing.

### Start the services:
```bash
cd backend
docker-compose up -d
```

### Access the backend:
- HTTPS: https://localhost (you'll see a browser security warning - this is normal for self-signed certs)
- HTTP: http://localhost (automatically redirects to HTTPS)

### Test the API:
```bash
# Health check
curl -k https://localhost/health

# Products endpoint
curl -k https://localhost/api/products
```

The `-k` flag bypasses SSL verification for self-signed certificates.

## Production (Real SSL Certificate)

### Option 1: Let's Encrypt (Free, Recommended)

#### On Your Server:
```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Stop nginx to free up port 80
cd backend
docker-compose down

# Generate certificate
sudo certbot certonly --standalone -d api.yourdomain.com

# Certificates will be at:
# /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
```

#### Update docker-compose.yml:
```yaml
nginx:
  build:
    context: .
    dockerfile: Dockerfile.nginx
  container_name: sgvmart-nginx
  ports:
    - "80:80"
    - "443:443"
  volumes:
    # Mount real SSL certificates
    - /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem:/etc/nginx/ssl/cert.pem:ro
    - /etc/letsencrypt/live/api.yourdomain.com/privkey.pem:/etc/nginx/ssl/key.pem:ro
  depends_on:
    - backend
  networks:
    - sgvmart-network
  restart: unless-stopped
```

#### Update nginx.conf:
Replace `server_name localhost;` with:
```nginx
server_name api.yourdomain.com;
```

#### Certificate Renewal (Let's Encrypt certs expire every 90 days):
```bash
# Add to crontab
sudo crontab -e

# Add this line (checks twice daily)
0 0,12 * * * certbot renew --quiet && cd /path/to/backend && docker-compose restart nginx
```

### Option 2: Manual Certificate Upload

If you have SSL certificates from a provider (e.g., Oracle Cloud, CloudFlare):

1. Copy your certificates to the server:
```bash
# Create SSL directory
mkdir -p ssl

# Copy your certificate files
scp certificate.crt user@server:/path/to/backend/ssl/
scp private.key user@server:/path/to/backend/ssl/
```

2. Update docker-compose.yml:
```yaml
nginx:
  build:
    context: .
    dockerfile: Dockerfile.nginx
  volumes:
    - ./ssl/certificate.crt:/etc/nginx/ssl/cert.pem:ro
    - ./ssl/private.key:/etc/nginx/ssl/key.pem:ro
  # ... rest of config
```

3. Restart:
```bash
docker-compose down
docker-compose up -d
```

### Option 3: Oracle Cloud Load Balancer

Use Oracle Cloud's load balancer for SSL termination:
1. Configure SSL at the load balancer level
2. Load balancer handles HTTPS (443) and routes to backend on HTTP (80)
3. Simplify nginx config to remove SSL:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Proxy settings
    location / {
        proxy_pass http://backend:3000;
        # ... proxy headers
    }
}
```

Update docker-compose.yml:
```yaml
nginx:
  ports:
    - "80:80"  # Only expose HTTP
  # Remove SSL certificate volumes
```

## CORS Configuration

Update the backend's CORS_ORIGIN environment variable to match your frontend:

```yaml
backend:
  environment:
    - CORS_ORIGIN=https://yourdomain.com
```

Or allow multiple origins:
```yaml
    - CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

## Security Considerations

1. **Never commit SSL private keys** to version control
   - Add to `.gitignore`: `ssl/*.key`, `ssl/*.pem`
   
2. **Use strong SSL configuration**
   - TLS 1.2 and 1.3 only (already configured)
   - Strong cipher suites (already configured)
   - HSTS header (already configured)

3. **Update JWT_SECRET** for production:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

4. **Database credentials**
   - Use strong passwords in production
   - Don't expose PostgreSQL port (5432) to the internet
   - Use environment variables from `.env` file

5. **Rate limiting**
   - Consider adding rate limiting to prevent abuse
   - Can be done at nginx level or application level

## Firewall Rules

On your server, ensure these ports are open:
```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to backend (3000) and PostgreSQL (5432) from internet
sudo ufw deny 3000/tcp
sudo ufw deny 5432/tcp

# Enable firewall
sudo ufw enable
```

## Monitoring

Check logs:
```bash
# Nginx logs
docker logs sgvmart-nginx

# Backend logs
docker logs sgvmart-backend

# PostgreSQL logs
docker logs sgvmart-postgres

# Follow logs in real-time
docker logs -f sgvmart-nginx
```

## Troubleshooting

### SSL Certificate Error
```bash
# Check certificate
docker exec sgvmart-nginx openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout

# Verify nginx config
docker exec sgvmart-nginx nginx -t
```

### Connection Refused
```bash
# Check if services are running
docker-compose ps

# Check network connectivity
docker exec sgvmart-nginx ping backend
```

### 502 Bad Gateway
- Backend service might not be running
- Check backend logs: `docker logs sgvmart-backend`
- Verify database connection

## Next Steps

1. Set up production SSL certificates (Let's Encrypt recommended)
2. Update CORS_ORIGIN for your domain
3. Configure DNS to point to your server
4. Set up automated certificate renewal
5. Consider adding a CDN (CloudFlare, etc.)
6. Set up monitoring and alerting
