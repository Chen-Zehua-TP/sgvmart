/**
 * Scheduled Cleanup Job for Guest Orders
 * 
 * This script should be run as a cron job (e.g., daily at 2 AM)
 * to cleanup old guest orders and prevent database bloat
 * 
 * Setup:
 * 1. Add to crontab: 0 2 * * * node /path/to/cleanup-guest-orders.js
 * 2. Or use a task scheduler like node-cron or PM2
 * 
 * Security: Only cleans up completed/cancelled guest orders
 * Data Retention: Keeps orders for 90 days by default
 */

import { cleanupOldGuestOrders } from '../services/order.service';
import prisma from '../config/database';

const DAYS_TO_KEEP = process.env.GUEST_ORDER_RETENTION_DAYS 
  ? parseInt(process.env.GUEST_ORDER_RETENTION_DAYS) 
  : 90;

async function runCleanup() {
  console.log(`Starting guest order cleanup (keeping last ${DAYS_TO_KEEP} days)...`);
  
  try {
    const result = await cleanupOldGuestOrders(DAYS_TO_KEEP);
    
    console.log(`Cleanup completed successfully:`);
    console.log(`- Deleted ${result.deletedCount} old guest orders`);
    console.log(`- Cutoff date: ${result.cutoffDate.toISOString()}`);
    
    // Optional: Log statistics
    const stats = await prisma.order.groupBy({
      by: ['status'],
      where: {
        userId: null,
        sessionId: { not: null },
      },
      _count: true,
    });
    
    console.log(`Remaining guest orders by status:`);
    stats.forEach((stat: any) => {
      console.log(`- ${stat.status}: ${stat._count}`);
    });
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run cleanup
runCleanup()
  .then(() => {
    console.log('Cleanup job finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
