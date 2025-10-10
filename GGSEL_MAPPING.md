# GGSel API Integration - Central Mapping Dictionary

## Overview
This document describes how GGSel API responses are mapped to our normalized product structure.

## Architecture

```
GGSel JSON API Response
        ↓
mapGGSelProductToNormalized() ← Central Mapping Dictionary
        ↓
Normalized GGSelProduct
        ↓
Display to User
```

## API Endpoint

**JSON Endpoint:**
```
https://ggsel.net/_next/data/DCG0vPgzxhYBXgxA1RmQ2/en/search/{query}.json?search_term={query}
```

## Data Structures

### GGSel API Product (Input)
```typescript
interface GGSelApiProduct {
  id_goods: number;              // Unique product ID
  url: string;                   // Product URL slug
  name: string;                  // Product name
  seller_name: string;           // Seller name
  images: string;                // Image filename
  price_wmr: string;            // Price in Russian Rubles
  price_wmz: string;            // Price in USD
  price_wme: string;            // Price in EUR
  price_wmz_for_one: number;    // Unit price in USD
  cnt_sell: number;             // Number of sales
  rating: number;               // Product/seller rating
  search_title: string;         // Category/search title
  is_active: boolean;           // Is product available
  is_preorder: boolean;         // Is this a preorder
  category_discount: number | null;  // Discount amount
  sale: number | null;          // Sale percentage
  // ... other fields
}
```

### Normalized Product (Output)
```typescript
interface GGSelProduct {
  id: string;                   // Unique identifier
  name: string;                 // Product name
  price: number;                // Current price (USD)
  originalPrice?: number;       // Price before discount
  imageUrl: string;            // Full image URL
  url: string;                 // Full product URL
  inStock: boolean;            // Availability status
  rating?: number;             // Rating (0-5)
  seller?: string;             // Seller name
  discount?: number;           // Discount percentage
  salesCount?: number;         // Total sales
  category?: string;           // Product category
}
```

## Central Mapping Dictionary

### Field Mappings

| Normalized Field | GGSel API Field | Transformation |
|-----------------|-----------------|----------------|
| `id` | `id_goods` | Convert to string |
| `name` | `name` | Direct mapping |
| `price` | `price_wmz_for_one` | Direct mapping (USD) |
| `originalPrice` | Calculated | `price + category_discount` OR calculated from `sale %` |
| `imageUrl` | `images`, `id_goods` | `https://img.ggsel.ru/{id_goods}/original/AUTOxAUTO/{images}` |
| `url` | `url` | `https://ggsel.net/en/catalog/product/{url}` |
| `inStock` | `is_active`, `is_preorder` | `is_active && !is_preorder` |
| `rating` | `rating` | Direct mapping |
| `seller` | `seller_name` | Direct mapping |
| `discount` | `category_discount`, `sale` | Calculate percentage from discount amount or use sale % |
| `salesCount` | `cnt_sell` | Direct mapping |
| `category` | `search_title` | Direct mapping |

### Discount Calculation Logic

```javascript
// category_discount is the discount amount in USD (not percentage)
// Formula: discount_percentage = (discount_amount / original_price) * 100
// Where: original_price = current_price + discount_amount

if (category_discount > 0) {
  originalPrice = price_wmz_for_one + category_discount
  discount = round((category_discount / originalPrice) * 100)
} else if (sale > 0) {
  discount = sale  // sale is already a percentage
  originalPrice = price_wmz_for_one / (1 - sale / 100)
}
```

**Example:**
- Current price: $1.83 (price_wmz_for_one)
- Discount amount: $5.15 (category_discount)
- Original price: $1.83 + $5.15 = $6.98
- Discount percentage: ($5.15 / $6.98) × 100 ≈ 74%

### Image URL Construction

```javascript
if (images) {
  imageUrl = `https://img.ggsel.ru/${id_goods}/original/AUTOxAUTO/${images}`
} else {
  imageUrl = `https://ui-avatars.com/api/?name=${name}&size=300&...`
}
```

**Format Breakdown:**
- Base URL: `https://img.ggsel.ru/`
- Product ID: `{id_goods}` (e.g., 4618152)
- Path: `/original/AUTOxAUTO/`
- Filename: `{images}` (e.g., 6877582_imgwebp.webp)

**Example:**
`https://img.ggsel.ru/4618152/original/AUTOxAUTO/6877582_imgwebp.webp`

## Usage Example

```typescript
// 1. Fetch from API
const response = await fetch(`https://ggsel.net/_next/data/.../search/hello.json?search_term=hello`);
const jsonData: GGSelApiResponse = await response.json();

// 2. Extract products
const apiProducts = jsonData.pageProps.searchGoods.data;

// 3. Map to normalized structure using central dictionary
const normalizedProducts = apiProducts.map(mapGGSelProductToNormalized);

// 4. Display to user
setSearchResults(normalizedProducts);
```

## Benefits

1. **Single Source of Truth**: All API field mappings are centralized in one function
2. **Type Safety**: Full TypeScript interfaces ensure data consistency
3. **Easy Maintenance**: Changes to API structure only require updating one function
4. **Testable**: Mapping logic can be easily unit tested
5. **Flexible**: Easy to add new fields or modify transformations
6. **Consistent**: All products follow the same normalized structure throughout the app

## Future Enhancements

- Add currency conversion options (WMR, WME)
- Implement caching for better performance
- Add pagination support
- Support for advanced filters (price range, rating, etc.)
- Multi-language support
