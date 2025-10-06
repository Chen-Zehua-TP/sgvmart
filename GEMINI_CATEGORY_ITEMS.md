# Gemini-Powered Category Items Feature

This feature uses Google's Gemini API to generate and cache popular items for each product category.

## Architecture

```
Client (Home Page) 
    ↓
    → Server (Express API)
        ↓
        → Gemini API (Generate Items)
            ↓
            → Database (PostgreSQL - Cache)
                ↓
                ← Client (Display Items as Buttons)
```

## Categories

1. **Games** 🎮
2. **Digital Currency & Items** 💰
3. **Software Products** 💻
4. **Gift Cards** 🎁
5. **Subscriptions** 📺

## Setup Instructions

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

### 2. Configure Backend

Add your Gemini API key to the `.env` file in the `backend` directory:

```env
GEMINI_API_KEY="your-actual-gemini-api-key"
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run Database Migration

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Start the Backend Server

```bash
cd backend
npm run dev
```

### 6. Start the Frontend

```bash
cd frontend
npm run dev
```

## How It Works

### Backend Flow

1. **First Request**: When category items are requested for the first time:
   - Server calls Gemini API with a structured prompt
   - Gemini generates 10 relevant items for the category
   - Items are saved to the database (PostgreSQL)
   - Items are returned to the client

2. **Subsequent Requests**: 
   - Server checks database cache first
   - Returns cached items immediately (no API call)
   - Much faster response time

3. **Refresh**: Admins can force refresh to regenerate items:
   - POST `/api/category-items/:category/refresh`
   - Deletes old items
   - Generates fresh items from Gemini

### Frontend Flow

1. **On Page Load**:
   - Home component fetches all category items
   - Displays them in organized sections by category
   - Shows loading spinner while fetching

2. **User Interaction**:
   - User clicks on a category item button (e.g., "Valorant")
   - Triggers search with item's keyword
   - Searches GGSel for products matching that keyword
   - Displays search results

## API Endpoints

### Public Endpoints

- `GET /api/category-items` - Get all category items
- `GET /api/category-items/:category` - Get items for specific category
- `GET /api/category-items/:category?refresh=true` - Force refresh from Gemini

### Protected Endpoints (Admin Only)

- `POST /api/category-items/:category/refresh` - Refresh category items

## Database Schema

```prisma
model CategoryItem {
  id          String   @id @default(uuid())
  category    String   // Category name
  name        String   // Item name (e.g., "Valorant")
  keywords    String[] // Search keywords
  imageUrl    String?  // Optional image URL
  description String?  // Brief description
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@map("category_items")
}
```

## Features

### ✅ Smart Caching
- Items are cached in database after first generation
- Reduces API calls and costs
- Faster page load times

### ✅ Dynamic Generation
- Gemini generates contextually relevant items
- Items are tailored to each category
- Includes popular and trending products

### ✅ User-Friendly Interface
- Beautiful card-based layout
- Category sections with icons
- Clickable buttons that trigger searches
- Responsive design

### ✅ Search Integration
- Click any item to search for it instantly
- Uses item's primary keyword for search
- Seamless integration with existing search

## Customization

### Modify Gemini Prompts

Edit `backend/src/services/gemini.service.ts` to customize the prompts:

```typescript
private buildPrompt(category: string): string {
  const categoryPrompts: Record<string, string> = {
    Games: `Your custom prompt here...`,
    // ... other categories
  };
  return categoryPrompts[category];
}
```

### Add New Categories

1. Update the categories array in `gemini.service.ts`
2. Add category-specific prompt
3. Add emoji icon in `Home.tsx`

### Change Number of Items

Modify the prompt to request more or fewer items (default is 10).

## Cost Considerations

- **Gemini API**: Free tier includes generous limits
- **First load**: One API call per category (5 calls total)
- **Cached loads**: No API calls (database only)
- **Refresh**: Manual trigger only (admin action)

## Troubleshooting

### "GEMINI_API_KEY is not set"
- Check your `.env` file in the backend directory
- Ensure the key is properly quoted
- Restart the backend server after adding the key

### "Property 'categoryItem' does not exist"
- Run `npx prisma generate` in the backend directory
- Restart your TypeScript server / IDE

### Items not showing up
- Check browser console for errors
- Verify backend is running on port 3000
- Check that Gemini API key is valid
- Look at backend logs for Gemini API errors

### Search not working
- Ensure CORS proxy is accessible
- Check network tab for failed requests
- Verify GGSel website structure hasn't changed

## Future Enhancements

- [ ] Add item images from Gemini
- [ ] Implement admin dashboard for managing items
- [ ] Add trending/popular indicators
- [ ] Implement user preferences for categories
- [ ] Add analytics for most-clicked items
- [ ] Support multiple languages
- [ ] Add item ratings/reviews

## License

MIT License - See LICENSE file for details
