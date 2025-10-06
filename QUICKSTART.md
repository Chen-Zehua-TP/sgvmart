# 🚀 Quick Start Checklist

## Prerequisites
- [ ] PostgreSQL database is running
- [ ] Node.js and npm are installed
- [ ] Backend dependencies are installed (`npm install` in backend/)
- [ ] Frontend dependencies are installed (`npm install` in frontend/)

## Setup Steps

### 1. Get Gemini API Key ⚡
- [ ] Visit https://makersuite.google.com/app/apikey
- [ ] Sign in with your Google account
- [ ] Click "Create API Key" or "Get API Key"
- [ ] Copy the generated API key

### 2. Configure Environment Variables 🔧
- [ ] Open `backend/.env`
- [ ] Find the line: `GEMINI_API_KEY="your-gemini-api-key-here"`
- [ ] Replace with your actual API key: `GEMINI_API_KEY="AIza..."`
- [ ] Save the file

### 3. Database Migration ✅
The migration has already been created and applied! But if you need to run it again:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Start the Backend 🖥️
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server is running on http://localhost:3000
📚 Environment: development
```

### 5. Start the Frontend 🌐
Open a new terminal:

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
```

### 6. Test the Feature 🧪

#### Option A: Use the Browser
1. [ ] Open http://localhost:5173
2. [ ] Wait for category items to load (first time: 10-30 seconds)
3. [ ] You should see 5 category sections with items
4. [ ] Click any item button (e.g., "Valorant")
5. [ ] Search results should appear

#### Option B: Use the Test Script
```bash
# In the project root
node test-gemini-api.js
```

This will test the API endpoints directly.

### 7. Verify Everything Works 🎯

- [ ] Home page loads without errors
- [ ] Category sections appear with items
- [ ] Items have names, descriptions, and keywords
- [ ] Clicking an item triggers a search
- [ ] Search results display correctly
- [ ] Backend logs show successful Gemini API calls
- [ ] Subsequent page loads are instant (cached data)

## Troubleshooting 🔍

### Backend won't start
```bash
# Make sure PostgreSQL is running
# Check if port 3000 is available
# Verify DATABASE_URL in .env is correct
```

### "GEMINI_API_KEY is not set" error
```bash
# Check backend/.env file
# Ensure the key is properly quoted
# Restart the backend server after adding the key
```

### "Property 'categoryItem' does not exist" error
```bash
cd backend
npx prisma generate
# Restart your IDE/editor
```

### Category items not loading
1. [ ] Check browser console for errors (F12)
2. [ ] Check backend terminal for errors
3. [ ] Verify Gemini API key is valid
4. [ ] Check network tab for failed requests
5. [ ] Ensure backend is running on port 3000

### First load takes too long
- This is normal! Gemini API calls take 5-10 seconds per category
- First load generates data for all 5 categories (30-50 seconds total)
- Subsequent loads are instant (uses cached data)

### Items show but search doesn't work
- [ ] Check if GGSel website is accessible
- [ ] Verify CORS proxy is working
- [ ] Check browser console for CORS errors

## API Endpoints Reference 📚

### Get All Category Items
```bash
curl http://localhost:3000/api/category-items
```

### Get Items for Specific Category
```bash
curl "http://localhost:3000/api/category-items/Games"
```

### Force Refresh (requires authentication)
```bash
curl -X POST "http://localhost:3000/api/category-items/Games/refresh" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Data Flow 🔄

```
1st Load (Fresh Data):
Browser → Server → Gemini API → Database → Server → Browser
⏱️ Time: 30-50 seconds (all categories)

2nd+ Load (Cached Data):
Browser → Server → Database → Browser
⏱️ Time: <1 second

Refresh (Admin Only):
Browser → Server → Delete Cache → Gemini API → Database → Browser
⏱️ Time: 5-10 seconds (one category)
```

## Success Indicators ✅

You know it's working when:
- ✅ No errors in browser console
- ✅ No errors in backend terminal
- ✅ 5 category sections visible on home page
- ✅ Each section has ~10 items
- ✅ Items have icons/emojis
- ✅ Hovering over items shows visual feedback
- ✅ Clicking items triggers search
- ✅ Page loads fast on subsequent visits

## Next Steps 🎨

After verifying everything works:
- [ ] Customize Gemini prompts for better items
- [ ] Add images to category items
- [ ] Implement admin dashboard for managing items
- [ ] Add analytics for popular items
- [ ] Customize styling to match your brand

## Getting Help 💬

If you encounter issues:
1. Check the browser console (F12)
2. Check the backend terminal logs
3. Review `GEMINI_CATEGORY_ITEMS.md` for detailed docs
4. Check `IMPLEMENTATION_SUMMARY.md` for architecture details

## Useful Commands 🛠️

```bash
# Restart everything
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Check database
cd backend && npx prisma studio

# View Prisma schema
cd backend && cat prisma/schema.prisma

# Test API
node test-gemini-api.js
```

---

## 🎉 You're All Set!

Once all checkboxes are marked, you should have a fully functional Gemini-powered category items feature on your home page!

Enjoy your AI-powered product discovery system! 🚀
