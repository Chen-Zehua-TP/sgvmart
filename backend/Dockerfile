# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL and Certbot for HTTPS certificate management
RUN apk add --no-cache openssl libc6-compat certbot curl

# Create necessary directories with proper permissions (as root)
RUN mkdir -p /var/log/letsencrypt /var/lib/letsencrypt /etc/letsencrypt && \
    chmod -R 777 /var/log/letsencrypt /var/lib/letsencrypt /etc/letsencrypt && \
    mkdir -p /var/www/certbot && \
    chmod -R 777 /var/www/certbot

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma Client
RUN npx prisma generate

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy entrypoint script for certificate setup
COPY backend-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership of app files
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose ports - 3000 for HTTP, 3443 for HTTPS
EXPOSE 3000 3443

# Health check - check HTTP port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start with entrypoint script for certificate handling
ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/server.js"]
