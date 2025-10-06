import { Request, Response } from 'express';
import { geminiService } from '../services/gemini.service';

export class CategoryItemsController {
  /**
   * Get all category items
   */
  async getAllCategoryItems(_req: Request, res: Response) {
    try {
      const categoryItems = await geminiService.getAllCategoryItems();
      res.json({
        success: true,
        data: categoryItems,
      });
    } catch (error: any) {
      console.error('Error fetching category items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch category items',
        error: error.message,
      });
    }
  }

  /**
   * Get items for a specific category
   */
  async getCategoryItems(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const { refresh } = req.query;

      const items = await geminiService.getCategoryItems(
        category,
        refresh === 'true'
      );

      res.json({
        success: true,
        data: items,
      });
    } catch (error: any) {
      console.error(`Error fetching items for category ${req.params.category}:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to fetch items for category ${req.params.category}`,
        error: error.message,
      });
    }
  }

  /**
   * Refresh category items (Admin only)
   */
  async refreshCategoryItems(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const items = await geminiService.refreshCategoryItems(category);

      res.json({
        success: true,
        message: `Successfully refreshed items for category: ${category}`,
        data: items,
      });
    } catch (error: any) {
      console.error(`Error refreshing items for category ${req.params.category}:`, error);
      res.status(500).json({
        success: false,
        message: `Failed to refresh items for category ${req.params.category}`,
        error: error.message,
      });
    }
  }
}

export const categoryItemsController = new CategoryItemsController();
