# System Architecture Diagram

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (React + Vite)                        │
│                     http://localhost:5173                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                    Home.tsx Component                       │   │
│  │                                                              │   │
│  │  State:                                                      │   │
│  │    - categoryItems: Record<string, CategoryItem[]>          │   │
│  │    - searchQuery: string                                    │   │
│  │    - searchResults: GGSelProduct[]                          │   │
│  │                                                              │   │
│  │  Effects:                                                    │   │
│  │    - useEffect: Fetch category items on mount               │   │
│  │                                                              │   │
│  │  UI:                                                         │   │
│  │    [Search Bar]                                             │   │
│  │    [🎮 Games Section] → [Buttons for each game]            │   │
│  │    [💰 Digital Currency Section] → [Buttons]               │   │
│  │    [💻 Software Section] → [Buttons]                       │   │
│  │    [🎁 Gift Cards Section] → [Buttons]                     │   │
│  │    [📺 Subscriptions Section] → [Buttons]                  │   │
│  │    [Search Results Grid] (conditional)                      │   │
│  │                                                              │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              │ API Calls                            │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │            categoryItems.service.ts                         │   │
│  │                                                              │   │
│  │  - getAllCategoryItems()                                    │   │
│  │  - getCategoryItems(category)                               │   │
│  │  - refreshCategoryItems(category)                           │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                               │ HTTP/REST
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                              ↓                                      │
│                    SERVER (Express + TypeScript)                    │
│                     http://localhost:3000                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                  server.ts (Main Entry)                     │   │
│  │                                                              │   │
│  │  Routes:                                                     │   │
│  │    /api/category-items              → categoryItemsRoutes   │   │
│  │    /api/auth                        → authRoutes            │   │
│  │    /api/products                    → productRoutes         │   │
│  │    ...                                                       │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │           categoryItems.routes.ts                           │   │
│  │                                                              │   │
│  │  GET  /                    → getAllCategoryItems()          │   │
│  │  GET  /:category           → getCategoryItems()             │   │
│  │  POST /:category/refresh   → refreshCategoryItems() [AUTH]  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │         categoryItems.controller.ts                         │   │
│  │                                                              │   │
│  │  - Handles HTTP requests/responses                          │   │
│  │  - Input validation                                         │   │
│  │  - Error handling                                           │   │
│  │  - Delegates to service layer                               │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ↓                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │              gemini.service.ts                              │   │
│  │                                                              │   │
│  │  Public Methods:                                            │   │
│  │    - getCategoryItems(category, forceRefresh?)              │   │
│  │    - getAllCategoryItems()                                  │   │
│  │    - refreshCategoryItems(category)                         │   │
│  │                                                              │   │
│  │  Private Methods:                                           │   │
│  │    - generateCategoryItems(category)                        │   │
│  │    - buildPrompt(category)                                  │   │
│  │                                                              │   │
│  │  Logic:                                                     │   │
│  │    1. Check database for cached items                       │   │
│  │    2. If not found → Call Gemini API                        │   │
│  │    3. Parse and save results to database                    │   │
│  │    4. Return items to controller                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ├─────────────┐                        │
│                              ↓             ↓                        │
│         ┌──────────────────────────┐   ┌──────────────────────┐   │
│         │   Gemini API Client      │   │   Prisma Client      │   │
│         │   (@google/generative-ai)│   │   (@prisma/client)   │   │
│         └──────────────────────────┘   └──────────────────────┘   │
│                    │                              │                │
└────────────────────┼──────────────────────────────┼────────────────┘
                     │                              │
                     │ API Calls                    │ SQL Queries
                     ↓                              ↓
      ┌──────────────────────────┐   ┌──────────────────────────┐
      │    Google Gemini API     │   │   PostgreSQL Database    │
      │  (gemini-pro model)      │   │                          │
      │                          │   │  Tables:                 │
      │  Generates:              │   │    - users               │
      │  - Item names            │   │    - products            │
      │  - Keywords              │   │    - categories          │
      │  - Descriptions          │   │    - category_items ★    │
      │                          │   │    - orders              │
      │  Categories:             │   │    - cart                │
      │  1. Games                │   │    ...                   │
      │  2. Digital Currency     │   │                          │
      │  3. Software             │   │  category_items:         │
      │  4. Gift Cards           │   │    - id (uuid)           │
      │  5. Subscriptions        │   │    - category            │
      │                          │   │    - name                │
      └──────────────────────────┘   │    - keywords[]          │
                                      │    - description         │
                                      │    - imageUrl            │
                                      │    - sortOrder           │
                                      │    - isActive            │
                                      │    - createdAt           │
                                      │    - updatedAt           │
                                      └──────────────────────────┘
```

## Data Flow Diagrams

### Flow 1: Initial Page Load (No Cache)

```
User                Browser              Server              Gemini API        Database
  │                    │                    │                     │               │
  │ 1. Visit home      │                    │                     │               │
  ├───────────────────>│                    │                     │               │
  │                    │                    │                     │               │
  │                    │ 2. Fetch items     │                     │               │
  │                    ├───────────────────>│                     │               │
  │                    │                    │                     │               │
  │                    │                    │ 3. Query cache      │               │
  │                    │                    ├────────────────────────────────────>│
  │                    │                    │                     │               │
  │                    │                    │ 4. Empty result     │               │
  │                    │                    │<────────────────────────────────────┤
  │                    │                    │                     │               │
  │                    │                    │ 5. Generate items   │               │
  │                    │                    ├────────────────────>│               │
  │                    │                    │                     │               │
  │                    │                    │ 6. AI response      │               │
  │                    │                    │<────────────────────┤               │
  │                    │                    │                     │               │
  │                    │                    │ 7. Save to cache    │               │
  │                    │                    ├────────────────────────────────────>│
  │                    │                    │                     │               │
  │                    │                    │ 8. Saved            │               │
  │                    │                    │<────────────────────────────────────┤
  │                    │                    │                     │               │
  │                    │ 9. Return items    │                     │               │
  │                    │<───────────────────┤                     │               │
  │                    │                    │                     │               │
  │ 10. Display items  │                    │                     │               │
  │<───────────────────┤                    │                     │               │
  │                    │                    │                     │               │

  Total Time: 30-50 seconds (all 5 categories)
```

### Flow 2: Subsequent Page Loads (With Cache)

```
User                Browser              Server              Database
  │                    │                    │                     │
  │ 1. Visit home      │                    │                     │
  ├───────────────────>│                    │                     │
  │                    │                    │                     │
  │                    │ 2. Fetch items     │                     │
  │                    ├───────────────────>│                     │
  │                    │                    │                     │
  │                    │                    │ 3. Query cache      │
  │                    │                    ├────────────────────>│
  │                    │                    │                     │
  │                    │                    │ 4. Cached items     │
  │                    │                    │<────────────────────┤
  │                    │                    │                     │
  │                    │ 5. Return items    │                     │
  │                    │<───────────────────┤                     │
  │                    │                    │                     │
  │ 6. Display items   │                    │                     │
  │<───────────────────┤                    │                     │
  │                    │                     │                    │

  Total Time: <1 second
```

### Flow 3: User Clicks Category Item

```
User                Browser              Server              GGSel Website
  │                    │                    │                     │
  │ 1. Click "Valorant"│                    │                     │
  ├───────────────────>│                    │                     │
  │                    │                    │                     │
  │                    │ 2. Set search query│                     │
  │                    │    = "valorant"    │                     │
  │                    │                    │                     │
  │                    │ 3. Fetch search    │                     │
  │                    │    (via CORS proxy)├────────────────────>│
  │                    │                    │                     │
  │                    │                    │ 4. HTML response    │
  │                    │<───────────────────┤<────────────────────┤
  │                    │                    │                     │
  │                    │ 5. Parse HTML      │                     │
  │                    │    Extract products│                     │
  │                    │                    │                     │
  │ 6. Display results │                    │                     │
  │<───────────────────┤                    │                     │
  │                    │                    │                     │

  Total Time: 2-5 seconds
```

## Component Hierarchy

```
App
 │
 └─ Layout
     │
     ├─ Header / Navigation
     │
     └─ Home (Route: /)
         │
         ├─ Search Bar Section
         │   ├─ Input Field
         │   └─ Search Button
         │
         ├─ Category Items Section (if no search results)
         │   │
         │   ├─ Games Category Card
         │   │   └─ Grid of Item Buttons
         │   │       ├─ Valorant Button
         │   │       ├─ Fortnite Button
         │   │       └─ ...
         │   │
         │   ├─ Digital Currency Card
         │   │   └─ Grid of Item Buttons
         │   │
         │   ├─ Software Products Card
         │   │   └─ Grid of Item Buttons
         │   │
         │   ├─ Gift Cards Card
         │   │   └─ Grid of Item Buttons
         │   │
         │   └─ Subscriptions Card
         │       └─ Grid of Item Buttons
         │
         └─ Search Results Section (if search active)
             └─ Grid of Product Cards
                 ├─ Product Card
                 ├─ Product Card
                 └─ ...
```

## Technology Stack

```
Frontend:
  - React 18
  - TypeScript
  - Vite
  - TailwindCSS
  - Axios

Backend:
  - Node.js
  - Express
  - TypeScript
  - Prisma ORM
  - PostgreSQL
  - Google Generative AI SDK

External APIs:
  - Google Gemini API (gemini-pro model)
  - GGSel (via CORS proxy)

Development:
  - nodemon (backend hot reload)
  - Vite dev server (frontend hot reload)
  - Prisma Studio (database GUI)
```

## File Structure

```
sgvmart/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma ★
│   │   └── migrations/
│   │       └── 20251006133632_add_category_items/ ★
│   ├── src/
│   │   ├── controllers/
│   │   │   └── categoryItems.controller.ts ★
│   │   ├── routes/
│   │   │   └── categoryItems.routes.ts ★
│   │   ├── services/
│   │   │   └── gemini.service.ts ★
│   │   └── server.ts (modified) ★
│   ├── .env ★
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx (modified) ★
│   │   ├── services/
│   │   │   └── categoryItems.service.ts ★
│   │   └── examples/
│   │       └── categoryItemsExample.ts ★
│   └── package.json
│
├── GEMINI_CATEGORY_ITEMS.md ★
├── IMPLEMENTATION_SUMMARY.md ★
├── QUICKSTART.md ★
├── ARCHITECTURE.md ★ (this file)
└── test-gemini-api.js ★

★ = New or modified files for this feature
```

---

This architecture provides a scalable, maintainable, and efficient system for displaying AI-generated category items with intelligent caching.
