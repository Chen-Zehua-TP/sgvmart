# Let's Encrypt SSL Setup Guide for ggvault.shop

## Prerequisites

Before deploying, ensure:

1. **Domain Points to Server**: Make sure your domain `ggvault.shop` is pointing to your server's IP address via DNS A records:
   ```
   ggvault.shop      A  YOUR_SERVER_IP
   www.ggvault.shop  A  YOUR_SERVER_IP
   ```

2. **Port 80 and 443 Open**: Ensure these ports are accessible from the internet for Let's Encrypt validation

3. **Environment Variables**: Update your `.env` file if needed:
   ```
   DOMAIN=ggvault.shop
   EMAIL=admin@ggvault.shop
   ```

## Deployment Steps

### 1. First Time Setup

When you run the Docker containers for the first time:

```bash
docker-compose down
docker-compose up -d
```

The entrypoint script will:
- Check if a certificate already exists
- Attempt to obtain a certificate from Let's Encrypt using HTTP-01 challenge
- Fall back to a self-signed certificate if Let's Encrypt fails
- Start nginx and begin the renewal check cycle

### 2. Monitor Certificate Acquisition

Check the frontend container logs:

```bash
docker logs sgvmart-frontend
```

You should see output like:
```
📝 Obtaining SSL certificate from Let's Encrypt for ggvault.shop...
✅ Certificate obtained successfully!
```

### 3. Verify Certificate

Once running, verify your certificate:

```bash
curl -I https://ggvault.shop
```

Or check certificate details:

```bash
openssl s_client -connect ggvault.shop:443 -servername ggvault.shop
```

## How It Works

### Certificate Renewal

The entrypoint script:
- Automatically checks for certificate renewal every 24 hours
- Certbot will attempt renewal 30 days before expiration
- On successful renewal, nginx is reloaded automatically
- Logs are stored at `/var/log/certbot-renewal.log` inside the container

### Files Involved

- **`frontend/Dockerfile`**: Updated to include Certbot and run the entrypoint script
- **`frontend/entrypoint.sh`**: Handles certificate initialization and renewal
- **`frontend/nginx.conf`**: Updated to use Let's Encrypt certificates and handle ACME challenges
- **`docker-compose.yml`**: Added volume mounts for persistent certificate storage

### Volume Mounts

Two Docker volumes ensure certificates persist between container restarts:
- `letsencrypt-data`: Stores Let's Encrypt certificates and renewal metadata
- `certbot-webroot`: Provides webroot for ACME HTTP-01 challenges

## Troubleshooting

### Certificate Generation Failed

If you see "Certificate generation failed":

1. **Check DNS**: Ensure your domain is resolving to your server
   ```bash
   nslookup ggvault.shop
   ```

2. **Check Port 80**: Ensure port 80 is accessible
   ```bash
   curl -I http://ggvault.shop
   ```

3. **View Logs**: 
   ```bash
   docker logs sgvmart-frontend
   docker exec sgvmart-frontend tail -f /var/log/certbot-renewal.log
   ```

4. **Manual Renewal**: 
   ```bash
   docker exec sgvmart-frontend certbot renew --force-renewal
   ```

### Certificate Permissions

If you encounter permission issues:

```bash
docker exec sgvmart-frontend chmod -R 755 /etc/letsencrypt
```

### Restart Services

To restart the frontend service:

```bash
docker-compose restart frontend
```

## Advanced: Manual Certificate Setup (Optional)

If automatic setup fails, you can manually obtain a certificate:

```bash
docker exec sgvmart-frontend certbot certonly --webroot \
  -w /var/www/certbot \
  -d ggvault.shop \
  -d www.ggvault.shop \
  --email admin@ggvault.shop \
  --agree-tos \
  --non-interactive
```

Then restart:
```bash
docker-compose restart frontend
```

## Certificate Locations in Container

- **Full Chain**: `/etc/letsencrypt/live/ggvault.shop/fullchain.pem`
- **Private Key**: `/etc/letsencrypt/live/ggvault.shop/privkey.pem`
- **Renewal Log**: `/var/log/certbot-renewal.log`
- **All Certificates**: `/etc/letsencrypt/archive/ggvault.shop/`

## Rate Limits

Let's Encrypt has rate limits:
- **50 certificates per registered domain per week**
- **5 duplicate certificates per week**

If you hit rate limits, you can use the staging environment for testing:

```bash
docker exec sgvmart-frontend certbot certonly --webroot \
  -w /var/www/certbot \
  -d ggvault.shop \
  --email admin@ggvault.shop \
  --agree-tos \
  --non-interactive \
  --staging
```

## Additional Notes

- The self-signed fallback certificate ensures your application continues running even if Let's Encrypt fails temporarily
- Swap to the self-signed certificate by updating `frontend/Dockerfile` if needed
- For production, it's recommended to use a monitoring solution to alert on certificate renewal failures

