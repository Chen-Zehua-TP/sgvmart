# External Products Feature Implementation

## Overview
This feature allows users to purchase external products (from GGSel) directly through the SGVMart platform. When a user purchases an external product, the admin receives the order details to manually process the purchase.

## Changes Made

### Database Schema (`backend/prisma/schema.prisma`)

#### Modified `Order` Model
Added support for external products:
- `isExternal` (Boolean): Flag to identify external product orders
- `externalProductName` (String?): Name of the external product
- `externalProductUrl` (String?): URL to the product on the external site
- `externalProductImageUrl` (String?): Product image URL
- `addressId`: Made optional since external orders might not need shipping address

#### Modified `CartItem` Model
Added support for external products in cart:
- `productId`: Made optional (external products don't have internal product IDs)
- `isExternal` (Boolean): Flag to identify external products
- `externalProductName` (String?): Name of the external product
- `externalProductUrl` (String?): URL to the product
- `externalProductPrice` (Decimal?): Price of the external product
- `externalProductImageUrl` (String?): Product image URL

### Backend API

#### New Endpoints

**POST /api/orders/external**
- Creates an order for an external product
- Requires authentication
- Body parameters:
  - `productName` (required): Name of the product
  - `productUrl` (required): URL to the product page
  - `productPrice` (required): Price of the product
  - `productImageUrl` (optional): Image URL
  - `quantity` (optional, default: 1): Quantity to order

**POST /api/cart/external**
- Adds an external product to the cart
- Requires authentication
- Body parameters:
  - `productName` (required): Name of the product
  - `productUrl` (required): URL to the product page
  - `productPrice` (required): Price of the product
  - `productImageUrl` (optional): Image URL
  - `quantity` (optional, default: 1): Quantity to add

#### Modified Services

**`backend/src/services/order.service.ts`**
- Added `createExternalProductOrder()` function
- Updated `createOrder()` to handle both regular and external products in cart
- Orders for external products are marked as 'Manual Processing'

**`backend/src/services/cart.service.ts`**
- Added `addExternalProductToCart()` function
- Updated `getOrCreateCart()` to calculate totals for both regular and external products
- Modified stock validation to skip external products

### Frontend UI (`frontend/src/pages/Home.tsx`)

#### Button Changes
Replaced the "View on GGSel" button with two action buttons:
1. **Buy Button** (Green): Directly purchases the product and creates an order
2. **Add to Cart Button** (Blue): Adds the product to cart for checkout later

#### New Functions
- `handleBuyNow()`: Creates an immediate order for the external product
- `handleAddToCart()`: Adds the external product to the user's cart
- Both functions require authentication (redirects to login if not authenticated)
- Show success/error messages to the user

#### User Experience
- Success messages appear for 2-3 seconds
- After successful "Buy" action, user is redirected to orders page
- Error messages appear if user is not logged in or if the request fails

## How It Works

### Purchase Flow
1. User searches for a product on the home page
2. GGSel products are displayed with "Buy" and "Add to Cart" buttons
3. **Buy Button**: 
   - User clicks "Buy"
   - System creates an order immediately
   - Order is marked as "PENDING" with payment method "Manual Processing"
   - Admin receives order with product details (name, URL, price, image)
   - User is redirected to orders page to track the order
4. **Add to Cart Button**:
   - User clicks "Add to Cart"
   - Product is added to cart with external product flag
   - User can continue shopping
   - At checkout, external products are processed separately

### Admin Processing
- Admin can view external orders in the admin dashboard
- Order contains:
  - Customer information
  - Product name
  - Product URL (to purchase from GGSel)
  - Product price
  - Product image
- Admin manually:
  1. Views the order details
  2. Purchases the product from GGSel using the provided URL
  3. Updates order status as it progresses
  4. Delivers the product to the customer

## Database Migration
A migration was created to add the new fields:
- Migration file: `20251006141036_add_external_products/migration.sql`
- Run with: `npx prisma migrate dev`

## Testing
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to home page
4. Search for a product (e.g., "Valorant", "Steam Wallet")
5. Click "Buy" or "Add to Cart" on any product
6. Verify order is created or product is added to cart

## Future Enhancements
- Automated email notifications to admin when external orders are placed
- Webhook integration with GGSel (if available)
- Bulk order processing for multiple external products
- Price tracking and automatic updates from external sources
