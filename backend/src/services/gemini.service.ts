import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryItemSuggestion {
  name: string;
  keywords: string[];
  description: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  /**
   * Generate category items using Gemini API
   */
  async generateCategoryItems(category: string): Promise<CategoryItemSuggestion[]> {
    const prompt = this.buildPrompt(category);

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsedResponse: CategoryItemSuggestion[] = JSON.parse(cleanedText);
      
      return parsedResponse;
    } catch (error: any) {
      console.error('Error generating category items:', error);
      throw new Error(`Failed to generate category items: ${error.message}`);
    }
  }

  /**
   * Build prompt for Gemini API based on category
   */
  private buildPrompt(category: string): string {
    const categoryPrompts: Record<string, string> = {
      Games: `Generate a list of 10 popular video games that are commonly sold as digital products. For each game, provide:
- name: The game title
- keywords: Array of search terms (game name variations, popular abbreviations)
- description: A brief 1-sentence description

Format the response as a JSON array. Example:
[
  {
    "name": "Valorant",
    "keywords": ["valorant", "valorant points", "vp", "riot points"],
    "description": "Tactical 5v5 character-based shooter game by Riot Games"
  }
]

Focus on currently popular games across PC, Console, and Mobile platforms.`,

      'Digital Currency & Items': `Generate a list of 10 popular digital currencies and in-game items that are commonly purchased. For each, provide:
- name: The currency/item name
- keywords: Array of search terms
- description: A brief 1-sentence description

Format the response as a JSON array. Include items like:
- Game currencies (V-Bucks, Riot Points, etc.)
- Platform currencies (Steam Wallet, PlayStation Network, etc.)
- Gaming accessories and items

Example format:
[
  {
    "name": "V-Bucks",
    "keywords": ["v-bucks", "fortnite currency", "fortnite vbucks", "vbucks"],
    "description": "Fortnite's in-game currency for purchasing cosmetics and Battle Pass"
  }
]`,

      'Software Products': `Generate a list of 10 popular software products that are commonly sold digitally. For each, provide:
- name: The software name
- keywords: Array of search terms
- description: A brief 1-sentence description

Format the response as a JSON array. Include:
- Operating systems
- Productivity software
- Creative software
- Antivirus/Security software

Example format:
[
  {
    "name": "Microsoft Office 365",
    "keywords": ["office 365", "microsoft office", "office suite", "ms office"],
    "description": "Comprehensive productivity suite including Word, Excel, PowerPoint, and more"
  }
]`,

      'Gift Cards': `Generate a list of 10 popular gift cards that are commonly purchased online. For each, provide:
- name: The gift card name
- keywords: Array of search terms
- description: A brief 1-sentence description

Format the response as a JSON array. Include:
- Gaming platform gift cards
- Streaming service gift cards
- Retail gift cards
- General purpose gift cards

Example format:
[
  {
    "name": "Steam Gift Card",
    "keywords": ["steam card", "steam wallet", "steam gift card", "valve gift card"],
    "description": "Digital gift card for Steam gaming platform to purchase games and content"
  }
]`,

      Subscriptions: `Generate a list of 10 popular subscription services that are commonly purchased. For each, provide:
- name: The subscription service name
- keywords: Array of search terms
- description: A brief 1-sentence description

Format the response as a JSON array. Include:
- Streaming services
- Gaming subscriptions
- Software subscriptions
- Cloud storage subscriptions

Example format:
[
  {
    "name": "Netflix Subscription",
    "keywords": ["netflix", "netflix premium", "netflix plan", "netflix membership"],
    "description": "Popular streaming service offering unlimited movies and TV shows"
  }
]`,
    };

    return categoryPrompts[category] || categoryPrompts['Games'];
  }

  /**
   * Fetch or generate category items with caching
   */
  async getCategoryItems(category: string, forceRefresh: boolean = false): Promise<any[]> {
    // Check if we have cached items
    if (!forceRefresh) {
      const cachedItems = await prisma.categoryItem.findMany({
        where: {
          category,
          isActive: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      if (cachedItems.length > 0) {
        return cachedItems;
      }
    }

    // Generate new items using Gemini
    const generatedItems = await this.generateCategoryItems(category);

    // Save to database
    const savedItems = await Promise.all(
      generatedItems.map(async (item, index) => {
        return prisma.categoryItem.create({
          data: {
            category,
            name: item.name,
            keywords: item.keywords,
            description: item.description,
            sortOrder: index,
            isActive: true,
          },
        });
      })
    );

    return savedItems;
  }

  /**
   * Get all category items grouped by category
   */
  async getAllCategoryItems(): Promise<Record<string, any[]>> {
    const categories = [
      'Games',
      'Digital Currency & Items',
      'Software Products',
      'Gift Cards',
      'Subscriptions',
    ];

    const result: Record<string, any[]> = {};

    for (const category of categories) {
      result[category] = await this.getCategoryItems(category);
    }

    return result;
  }

  /**
   * Refresh category items (admin functionality)
   */
  async refreshCategoryItems(category: string): Promise<any[]> {
    // Delete existing items for this category
    await prisma.categoryItem.deleteMany({
      where: { category },
    });

    // Generate fresh items
    return this.getCategoryItems(category, true);
  }
}

export const geminiService = new GeminiService();
