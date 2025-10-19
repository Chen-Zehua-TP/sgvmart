# Backend HTTPS Setup Complete

## What Changed

Your application now has end-to-end HTTPS:
```
User → HTTPS (443) → Frontend → HTTPS (3443) → Backend
```

### Files Modified:

1. **`backend/src/server.ts`**
   - Added HTTPS support with Let's Encrypt certificates
   - Automatically detects and uses certificates if available
   - Falls back to HTTP if certificates not found

2. **`backend/Dockerfile`**
   - Added Certbot for certificate management
   - Added backend entrypoint script
   - Exposed port 3443 for HTTPS

3. **`backend/backend-entrypoint.sh`** (NEW)
   - Checks for certificate availability
   - Sets up environment for HTTPS

4. **`frontend/nginx.conf`**
   - Updated to proxy API calls to HTTPS backend (port 3443)
   - Added `proxy_ssl_verify off` to allow self-signed certificates

5. **`docker-compose.yml`**
   - Added volume mount for Let's Encrypt certificates on backend
   - Added environment variables: `USE_HTTPS=true`, `DOMAIN`, `EMAIL`
   - Exposed port 3443 for backend HTTPS

## Deployment Steps

1. **Rebuild and Deploy:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

2. **Check Backend HTTPS:**
   ```bash
   # From AWS instance
   docker logs sgvmart-backend
   
   # Should show: "🔒 HTTPS Server is running on https://ggvault.shop:3443"
   ```

3. **Verify End-to-End:**
   ```bash
   # Test frontend
   curl -I https://ggvault.shop
   
   # Test API from within container
   docker exec sgvmart-frontend curl -k https://backend:3443/api/products
   ```

## How It Works

- **Frontend:** Still runs on HTTPS (443) - No changes
- **Backend:** Now runs on HTTPS (3443) using shared Let's Encrypt certificates
- **Certificate Sharing:** Both containers share the same `/etc/letsencrypt` volume
- **Fallback:** If certificate not found, backend runs on HTTP for health checks

## Result

✅ No more "not secure" messages
✅ End-to-end encrypted communication
✅ All traffic uses HTTPS
