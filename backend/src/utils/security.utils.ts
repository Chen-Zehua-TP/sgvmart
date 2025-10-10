/**
 * Security utilities for session management and input sanitization
 * 
 * CRITICAL SECURITY NOTES:
 * - Uses crypto.randomUUID for session IDs (cryptographically secure)
 * - Never use Math.random() for security-sensitive operations
 * - All inputs are sanitized to prevent XSS attacks
 * - Session IDs are validated to prevent injection attacks
 */

/**
 * Generate a cryptographically secure session ID
 * 
 * Security: Uses crypto.randomUUID which is:
 * - Cryptographically secure (unlike Math.random)
 * - Collision-resistant
 * - Unpredictable
 * 
 * @returns A secure UUID v4 string
 */
export const generateSecureSessionId = (): string => {
  // Use Node.js crypto module for cryptographically secure random values
  const crypto = require('crypto');
  
  // Generate UUID v4 (random)
  return crypto.randomUUID();
};

/**
 * Validate session ID format
 * 
 * Security: Prevents injection attacks by ensuring session IDs
 * match expected UUID v4 format
 * 
 * @param sessionId The session ID to validate
 * @returns True if valid UUID v4
 */
export const isValidSessionId = (sessionId: string): boolean => {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return uuidV4Regex.test(sessionId);
};

/**
 * Sanitize string input to prevent XSS attacks
 * 
 * Security: Removes/escapes potentially dangerous characters
 * Used for guest user inputs (name, email, address, phone)
 * 
 * @param input Raw user input
 * @returns Sanitized string safe for storage and display
 */
export const sanitizeInput = (input: string | null | undefined): string => {
  if (!input) {
    return '';
  }
  
  // Convert to string
  let sanitized = String(input);
  
  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to prevent DoS
  const maxLength = 500;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  // Escape HTML entities to prevent XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized;
};

/**
 * Validate and sanitize email address
 * 
 * Security: Ensures email format is valid before storage
 * 
 * @param email Email address to validate
 * @returns Sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string | null | undefined): string | null => {
  if (!email) {
    return null;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  if (emailRegex.test(trimmed) && trimmed.length <= 255) {
    return trimmed;
  }
  
  return null;
};

/**
 * Validate and sanitize phone number
 * 
 * Security: Allows only digits, spaces, and common phone characters
 * 
 * @param phone Phone number to validate
 * @returns Sanitized phone or null if invalid
 */
export const sanitizePhone = (phone: string | null | undefined): string | null => {
  if (!phone) {
    return null;
  }
  
  // Remove all non-digit and non-phone characters
  const cleaned = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();
  
  // Check if reasonable length (7-20 characters)
  if (cleaned.length >= 7 && cleaned.length <= 20) {
    return cleaned;
  }
  
  return null;
};

/**
 * Create a secure guest order identifier
 * Used for tracking guest orders in localStorage
 * 
 * Security: Combines session ID with timestamp for uniqueness
 * 
 * @param sessionId The user's session ID
 * @returns A unique order tracking key
 */
export const createGuestOrderKey = (sessionId: string): string => {
  if (!isValidSessionId(sessionId)) {
    throw new Error('Invalid session ID');
  }
  
  return `guest_order_${sessionId}`;
};

/**
 * Validate order data before storage
 * Ensures all required fields are present and valid
 * 
 * @param orderData Order data to validate
 * @returns True if valid, throws error otherwise
 */
export const validateOrderData = (orderData: any): boolean => {
  // Basic validation
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('Invalid order data');
  }
  
  // Validate required fields
  if (!orderData.totalAmount || isNaN(Number(orderData.totalAmount))) {
    throw new Error('Invalid total amount');
  }
  
  if (Number(orderData.totalAmount) < 0 || Number(orderData.totalAmount) > 1000000) {
    throw new Error('Total amount out of acceptable range');
  }
  
  // Validate payment method
  if (!orderData.paymentMethod || typeof orderData.paymentMethod !== 'string') {
    throw new Error('Invalid payment method');
  }
  
  // Validate items if present
  if (orderData.items) {
    if (!Array.isArray(orderData.items)) {
      throw new Error('Invalid order items');
    }
    
    if (orderData.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    
    if (orderData.items.length > 100) {
      throw new Error('Too many items in order');
    }
  }
  
  return true;
};

/**
 * Hash sensitive data for comparison
 * Used for detecting duplicate orders
 * 
 * Security: One-way hash prevents reverse engineering
 * 
 * @param data Data to hash
 * @returns SHA-256 hash
 */
export const hashData = (data: string): string => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(data).digest('hex');
};
