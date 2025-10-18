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

# Install OpenSSL
RUN apk add --no-cache openssl

# Create SSL directory
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificate (for development)
# Replace with real certificates in production
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports 80 (redirect) and 443 (HTTPS)
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
