import { Request, Response, NextFunction } from 'express';

/**
 * Production-ready rate limiter middleware
 * Prevents abuse by limiting requests per IP/user
 * 
 * Security: Uses in-memory store (consider Redis for production clusters)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Key format: "ip:endpoint" or "user:userId:endpoint"
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum requests per window
  keyPrefix?: string;  // Prefix for the rate limit key
  skipSuccessfulRequests?: boolean;  // Don't count successful requests
  message?: string;  // Custom error message
}

/**
 * Create a rate limiter middleware
 * @param options Rate limiting configuration
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    keyPrefix = 'general',
    skipSuccessfulRequests = false,
    message = 'Too many requests, please try again later.',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Security: Use both IP and user ID for authenticated requests
      const userId = (req as any).user?.id;
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Create unique key for this client
      const key = userId 
        ? `user:${userId}:${keyPrefix}`
        : `ip:${ip}:${keyPrefix}`;

      const now = Date.now();
      const entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        // Create new entry
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
        next();
        return;
      }

      if (entry.count >= maxRequests) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        res.status(429).json({
          error: message,
          retryAfter,
        });
        return;
      }

      // Increment counter
      entry.count++;
      
      if (!skipSuccessfulRequests) {
        next();
      } else {
        // Only count if request fails
        res.on('finish', () => {
          if (res.statusCode >= 400) {
            // Request failed, count is already incremented
          } else {
            // Request succeeded, decrement counter
            const currentEntry = rateLimitStore.get(key);
            if (currentEntry) {
              currentEntry.count--;
            }
          }
        });
        next();
      }
    } catch (error) {
      // Don't block requests if rate limiter fails
      console.error('Rate limiter error:', error);
      next();
    }
  };
};

/**
 * Preset: Order creation rate limiter (10 orders per minute)
 * Security: Prevents order spam and potential abuse
 */
export const orderCreationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  keyPrefix: 'order-create',
  message: 'Too many orders created. Please wait a moment before creating another order.',
});

/**
 * Preset: Order migration rate limiter (5 migrations per minute)
 * Security: Prevents migration endpoint abuse
 */
export const orderMigrationLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyPrefix: 'order-migrate',
  message: 'Too many migration requests. Please wait a moment before trying again.',
});

/**
 * Preset: General API rate limiter (100 requests per minute)
 */
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyPrefix: 'general-api',
  message: 'Too many requests. Please slow down.',
});
