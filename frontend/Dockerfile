# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Install Certbot and dependencies
RUN apk add --no-cache \
    certbot \
    certbot-nginx \
    openssl \
    curl

# Create SSL and certbot directories
RUN mkdir -p /etc/nginx/ssl /etc/letsencrypt/live /var/www/certbot

# Create entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports 80 (redirect) and 443 (HTTPS)
EXPOSE 80 443

# Start with entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
