# Guest Shopping - Quick Start Guide

## 🎯 What's New?

**No Account Required!** Users can now shop, add to cart, and purchase products without creating an account.

**10% Discount Incentive!** All guest purchases receive an automatic 10% discount when they provide their email.

## 🚀 Quick Start

### For Users:

1. **Visit the Homepage** (http://localhost:5173)
   - Browse or search for products
   - No login required!

2. **Quick Purchase**:
   - Click the green **"Buy"** button on any product
   - Email modal appears with 10% discount offer
   - Enter your email
   - Click "Complete Purchase with 10% Off"
   - Done! Order placed with discount

3. **Shop Multiple Items**:
   - Click blue **"Add to Cart"** button on products
   - View your cart at any time
   - See your 10% discount preview
   - Click "Checkout with 10% Off"
   - Enter email and complete purchase

4. **Track Your Orders**:
   - Click **"Orders"** in the navigation
   - View all your guest orders
   - See your savings from the 10% discount
   - Access product links

## 📱 User Interface

### Navigation Bar
- **Home**: Browse products
- **Products**: View all products (if available)
- **Cart**: View shopping cart (shows discount preview)
- **Orders**: Track your orders
- Login/Register links are hidden

### Home Page - Product Cards
Each product shows:
- Product image
- Product name
- Price
- Rating (if available)
- **Two buttons**:
  - 🟢 **Buy** - Quick purchase with email prompt
  - 🔵 **Add to Cart** - Add to cart for later

### Email Modal (appears on Buy click)
- Product preview with image
- Original price (strikethrough)
- Discounted price (10% off)
- Savings amount highlighted
- Email input field
- "Complete Purchase with 10% Off" button

### Cart Page
**Guest Cart Section**:
- All items with images
- Quantity controls (increase/decrease)
- Remove item (✕) button
- Subtotal (original price, strikethrough)
- **Total with 10% OFF** (green, bold)
- Savings amount: "🎉 You'll save $X.XX at checkout!"
- "Checkout with 10% Off" button

### Orders Page
**Recent Orders Section**:
- Order ID and date
- Customer email
- Product details with image
- Original price vs. discounted price
- Discount badge: "10% OFF"
- Total savings displayed
- Link to view product
- Order status
- Confirmation note about email

## 💡 Key Features

### 1. Persistent Data
- Cart items saved in browser (localStorage)
- Orders saved in browser (localStorage)
- Data persists across page refreshes
- Clear cart option available

### 2. 10% Discount
- Applied to ALL guest purchases
- No discount codes needed
- Automatic calculation
- Clearly displayed before purchase

### 3. Email Collection
- Required for purchase completion
- Validates email format
- Used for order confirmation
- Future marketing opportunities

### 4. No Account Barrier
- Zero friction shopping
- No password to remember
- No form to fill out
- Just email and go!

## 🧪 Testing Scenarios

### Test 1: Quick Buy
1. Go to home page
2. Search for "Valorant"
3. Click green "Buy" button
4. Enter: `test@email.com`
5. Click "Complete Purchase"
6. ✅ Success message shows savings
7. ✅ Check Orders page - order appears

### Test 2: Cart Shopping
1. Go to home page
2. Search for products
3. Click "Add to Cart" on 3 different products
4. Go to Cart page
5. ✅ All 3 items visible
6. ✅ 10% discount shown in green
7. Adjust quantities
8. Click "Checkout with 10% Off"
9. Enter email
10. ✅ Orders created with discount

### Test 3: Data Persistence
1. Add items to cart
2. Close browser
3. Reopen http://localhost:5173
4. Go to Cart page
5. ✅ Items still in cart
6. Go to Orders page
7. ✅ Previous orders still visible

## 📊 Data Management

### Stored in Browser (localStorage):

**guestCart** - Active shopping cart
- Items waiting for checkout
- Includes quantities

**guestOrders** - Completed orders
- Purchase history
- Includes email and discount info

### Clear Data:
```javascript
// In browser console:
localStorage.removeItem('guestCart');    // Clear cart
localStorage.removeItem('guestOrders');  // Clear orders
// Or clear all:
localStorage.clear();
```

## 🎨 Visual Highlights

### Colors:
- 🟢 **Green**: Buy button, discounts, savings
- 🔵 **Blue**: Add to Cart, continue shopping
- 🟡 **Yellow**: Order status badges
- 🔴 **Red**: Remove/clear actions

### Typography:
- **Bold** for prices and totals
- ~~Strikethrough~~ for original prices
- Large numbers for discounted totals

### Icons:
- 🎉 Celebration for savings
- ✕ Remove from cart
- → External links

## 🔒 Privacy Note
All data is stored locally in the user's browser. No server-side tracking for guest users. Email addresses are collected but stored only in the browser's localStorage.

## 🐛 Troubleshooting

**Cart is empty after refresh?**
- Check if localStorage is enabled in browser
- Private/Incognito mode may not persist data

**Email not accepting?**
- Must include @ symbol
- Example: `user@email.com`

**Orders not showing?**
- Check browser's localStorage
- Try different browser if issues persist

## 📧 Admin Integration

When a guest order is placed, the admin should:
1. Check the Orders database/localStorage
2. Note the customer email
3. Purchase the product from GGSel using the URL
4. Send confirmation to customer email
5. Update order status (manual process)

---

**🎉 Happy Shopping! No account needed!**
