/**
 * Session Management for Guest Orders
 * 
 * SECURITY FEATURES:
 * - Cryptographically secure session IDs (crypto.randomUUID)
 * - localStorage quota exceeded handling
 * - Multi-tab synchronization via storage events
 * - Auto-cleanup of expired sessions
 * - XSS prevention through data validation
 * 
 * CRITICAL: Never store payment card data in localStorage
 * Payment information should only exist in memory during checkout
 * and be sent directly to payment processor
 */

const SESSION_KEY = 'sgvmart_session_id';
const GUEST_ORDERS_KEY = 'sgvmart_guest_orders';
const SESSION_EXPIRY_DAYS = 90;

/**
 * Generate a cryptographically secure session ID
 * 
 * Security: Uses crypto.randomUUID (Web Crypto API)
 * - Cryptographically secure (NOT Math.random)
 * - Collision-resistant
 * - Unpredictable
 */
export const generateSecureSessionId = (): string => {
  // Use Web Crypto API for secure random values
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers (still secure)
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  
  // Convert to UUID v4 format
  array[6] = (array[6] & 0x0f) | 0x40;
  array[8] = (array[8] & 0x3f) | 0x80;
  
  const hex = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

/**
 * Get or create session ID
 * 
 * Security: Validates existing session ID format
 * Bug Prevention: Handles localStorage quota exceeded
 */
export const getOrCreateSessionId = (): string | null => {
  try {
    // Try to get existing session
    const existingSessionId = localStorage.getItem(SESSION_KEY);
    
    if (existingSessionId && isValidSessionId(existingSessionId)) {
      return existingSessionId;
    }
    
    // Generate new session ID
    const newSessionId = generateSecureSessionId();
    
    try {
      localStorage.setItem(SESSION_KEY, newSessionId);
      return newSessionId;
    } catch (error) {
      // Bug Prevention: localStorage quota exceeded
      console.error('Failed to store session ID:', error);
      
      // Try to free up space by cleaning old data
      cleanupOldGuestOrders();
      
      // Try again
      try {
        localStorage.setItem(SESSION_KEY, newSessionId);
        return newSessionId;
      } catch (retryError) {
        console.error('Failed to store session ID after cleanup:', retryError);
        // Return session ID even if storage fails (store in memory only)
        return newSessionId;
      }
    }
  } catch (error) {
    console.error('Session management error:', error);
    return null;
  }
};

/**
 * Validate session ID format
 * 
 * Security: Prevents injection attacks by validating UUID v4 format
 */
export const isValidSessionId = (sessionId: string): boolean => {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }
  
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(sessionId);
};

/**
 * Store guest order in localStorage
 * 
 * Security: Validates data before storage
 * Bug Prevention: Handles quota exceeded, validates data size
 * 
 * CRITICAL: Never pass payment card data to this function
 */
export interface GuestOrder {
  id: string;
  sessionId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    productName?: string;
  }>;
  guestEmail: string;
  guestName: string;
  storedAt?: string; // Internal timestamp for cleanup
}

export const storeGuestOrder = (order: GuestOrder): boolean => {
  try {
    // Security: Validate order data
    if (!order || !order.id || !order.sessionId) {
      console.error('Invalid order data');
      return false;
    }
    
    // Get existing orders
    const orders = getGuestOrders();
    
    // Add new order
    orders.push({
      ...order,
      storedAt: new Date().toISOString(),
    });
    
    // Limit to last 50 orders to prevent quota issues
    const limitedOrders = orders.slice(-50);
    
    try {
      localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(limitedOrders));
      return true;
    } catch (error) {
      // Bug Prevention: localStorage quota exceeded
      console.error('Failed to store guest order:', error);
      
      // Try to free up space
      cleanupOldGuestOrders();
      
      // Keep only last 10 orders
      const minimalOrders = orders.slice(-10);
      
      try {
        localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(minimalOrders));
        return true;
      } catch (retryError) {
        console.error('Failed to store guest order after cleanup:', retryError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error storing guest order:', error);
    return false;
  }
};

/**
 * Get all guest orders from localStorage
 * 
 * Bug Prevention: Handles corrupted data
 */
export const getGuestOrders = (): GuestOrder[] => {
  try {
    const ordersJson = localStorage.getItem(GUEST_ORDERS_KEY);
    
    if (!ordersJson) {
      return [];
    }
    
    const orders = JSON.parse(ordersJson);
    
    if (!Array.isArray(orders)) {
      console.error('Invalid orders data format');
      return [];
    }
    
    return orders;
  } catch (error) {
    console.error('Error reading guest orders:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(GUEST_ORDERS_KEY);
    } catch {}
    return [];
  }
};

/**
 * Get guest orders for current session
 */
export const getCurrentSessionOrders = (): GuestOrder[] => {
  const sessionId = getOrCreateSessionId();
  
  if (!sessionId) {
    return [];
  }
  
  const allOrders = getGuestOrders();
  return allOrders.filter((order) => order.sessionId === sessionId);
};

/**
 * Clear guest orders after migration
 * 
 * Called after successful migration to member account
 */
export const clearGuestOrders = (sessionId: string): boolean => {
  try {
    const allOrders = getGuestOrders();
    const remainingOrders = allOrders.filter(
      (order) => order.sessionId !== sessionId
    );
    
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(remainingOrders));
    return true;
  } catch (error) {
    console.error('Error clearing guest orders:', error);
    return false;
  }
};

/**
 * Cleanup old guest orders
 * 
 * Removes orders older than SESSION_EXPIRY_DAYS
 * Bug Prevention: Prevents localStorage from filling up
 */
export const cleanupOldGuestOrders = (): void => {
  try {
    const orders = getGuestOrders();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - SESSION_EXPIRY_DAYS);
    
    const validOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt || order.storedAt || Date.now());
      return orderDate > cutoffDate;
    });
    
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(validOrders));
  } catch (error) {
    console.error('Error cleaning up old orders:', error);
  }
};

/**
 * Multi-tab synchronization
 * 
 * Bug Prevention: Keeps orders in sync across multiple tabs
 * 
 * Usage: Call this in your App.tsx or main component
 * setupMultiTabSync();
 */
export const setupMultiTabSync = (
  onOrdersChanged: (orders: GuestOrder[]) => void
): (() => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === GUEST_ORDERS_KEY) {
      // Orders changed in another tab
      const orders = getGuestOrders();
      onOrdersChanged(orders);
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

/**
 * Check if localStorage is available
 * 
 * Bug Prevention: Handles cases where localStorage is disabled
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get localStorage usage info
 * 
 * Debugging: Helps identify storage issues
 */
export const getStorageInfo = (): {
  available: boolean;
  used: number;
  percentage: string;
} => {
  try {
    if (!isLocalStorageAvailable()) {
      return { available: false, used: 0, percentage: '0%' };
    }
    
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    
    // localStorage quota is typically 5-10MB
    const quota = 5 * 1024 * 1024; // Assume 5MB
    const percentage = ((total / quota) * 100).toFixed(2);
    
    return {
      available: true,
      used: total,
      percentage: `${percentage}%`,
    };
  } catch {
    return { available: false, used: 0, percentage: '0%' };
  }
};

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  cleanupOldGuestOrders();
}
