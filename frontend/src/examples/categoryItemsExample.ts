/**
 * Example of Category Items Response from Gemini API
 * This shows what kind of data will be generated and displayed
 */

export const exampleCategoryItems = {
  "Games": [
    {
      "name": "Valorant",
      "keywords": ["valorant", "valorant points", "vp", "riot points"],
      "description": "Tactical 5v5 character-based shooter game by Riot Games"
    },
    {
      "name": "Fortnite",
      "keywords": ["fortnite", "fortnite skins", "fortnite battle pass"],
      "description": "Popular battle royale game with building mechanics"
    },
    {
      "name": "League of Legends",
      "keywords": ["lol", "league", "league of legends", "riot points"],
      "description": "Multiplayer online battle arena (MOBA) game by Riot Games"
    },
    {
      "name": "Minecraft",
      "keywords": ["minecraft", "minecraft java", "minecraft bedrock"],
      "description": "Sandbox game where players can build and explore infinite worlds"
    },
    {
      "name": "Apex Legends",
      "keywords": ["apex", "apex legends", "apex coins"],
      "description": "Free-to-play battle royale hero shooter"
    }
  ],
  
  "Digital Currency & Items": [
    {
      "name": "V-Bucks",
      "keywords": ["v-bucks", "fortnite currency", "fortnite vbucks"],
      "description": "Fortnite's in-game currency for purchasing cosmetics and Battle Pass"
    },
    {
      "name": "Steam Wallet",
      "keywords": ["steam wallet", "steam funds", "steam money"],
      "description": "Digital currency for purchasing games and content on Steam"
    },
    {
      "name": "Riot Points",
      "keywords": ["riot points", "rp", "valorant points", "lol rp"],
      "description": "Currency for Riot Games titles like League of Legends and Valorant"
    },
    {
      "name": "Robux",
      "keywords": ["robux", "roblox currency", "roblox robux"],
      "description": "Virtual currency used in the Roblox gaming platform"
    }
  ],
  
  "Software Products": [
    {
      "name": "Microsoft Office 365",
      "keywords": ["office 365", "microsoft office", "office suite"],
      "description": "Comprehensive productivity suite including Word, Excel, PowerPoint"
    },
    {
      "name": "Windows 11",
      "keywords": ["windows 11", "windows", "microsoft windows"],
      "description": "Latest version of Microsoft's operating system"
    },
    {
      "name": "Adobe Creative Cloud",
      "keywords": ["adobe", "photoshop", "creative cloud"],
      "description": "Suite of creative applications including Photoshop, Illustrator, Premiere"
    }
  ],
  
  "Gift Cards": [
    {
      "name": "Steam Gift Card",
      "keywords": ["steam card", "steam wallet", "steam gift card"],
      "description": "Digital gift card for Steam gaming platform"
    },
    {
      "name": "PlayStation Network",
      "keywords": ["psn", "playstation network", "psn card"],
      "description": "Gift card for PlayStation Store purchases"
    },
    {
      "name": "Xbox Gift Card",
      "keywords": ["xbox", "xbox gift card", "microsoft store"],
      "description": "Gift card for Xbox and Microsoft Store"
    },
    {
      "name": "Nintendo eShop",
      "keywords": ["nintendo", "eshop", "switch card"],
      "description": "Digital currency for Nintendo Switch games and content"
    }
  ],
  
  "Subscriptions": [
    {
      "name": "Netflix Subscription",
      "keywords": ["netflix", "netflix premium", "netflix plan"],
      "description": "Popular streaming service offering unlimited movies and TV shows"
    },
    {
      "name": "Xbox Game Pass",
      "keywords": ["game pass", "xbox game pass", "gamepass ultimate"],
      "description": "Subscription service providing access to hundreds of games"
    },
    {
      "name": "Spotify Premium",
      "keywords": ["spotify", "spotify premium", "spotify subscription"],
      "description": "Music streaming service with ad-free listening"
    },
    {
      "name": "Discord Nitro",
      "keywords": ["discord nitro", "discord premium", "nitro"],
      "description": "Premium subscription for enhanced Discord features"
    }
  ]
};

/**
 * Visual representation of the Home Page UI:
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │        🔍 Search GGSel Products                     │
 * │   [Search input field.....................] [🔍]    │
 * └─────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │  🎮 Games                                           │
 * │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
 * │  │Valorant │ │Fortnite │ │League of│ │Minecraft│  │
 * │  │  [IMG]  │ │  [IMG]  │ │ Legends │ │  [IMG]  │  │
 * │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
 * └─────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │  💰 Digital Currency & Items                        │
 * │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
 * │  │V-Bucks  │ │ Steam   │ │  Riot   │ │ Robux   │  │
 * │  │  [IMG]  │ │ Wallet  │ │ Points  │ │  [IMG]  │  │
 * │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
 * └─────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────┐
 * │  💻 Software Products                               │
 * │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
 * │  │Office   │ │Windows  │ │  Adobe  │ │ Norton  │  │
 * │  │  365    │ │   11    │ │Creative │ │  360    │  │
 * │  └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
 * └─────────────────────────────────────────────────────┘
 * 
 * [... similar sections for Gift Cards and Subscriptions]
 * 
 * User Flow:
 * 1. User clicks "Valorant" button
 * 2. Search query = "valorant" 
 * 3. Fetches products from GGSel
 * 4. Displays search results below
 */
