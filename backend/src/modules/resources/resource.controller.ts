import { Request, Response } from 'express';
import { ResourceService } from './resource.service';
import { MetadataService, normalizeUrl } from './metadata.service';
import { Resource } from './resource.model';
import { Collection } from '../collections/collection.model';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class ResourceController {
  static async list(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await ResourceService.list({
        userId,
        ...req.query as any,
      });

      return sendSuccess(res, result.resources, 'Resources retrieved', 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Error listing resources', 500);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const resource = await ResourceService.create(userId, req.body);
      return sendSuccess(res, resource, 'Resource created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create resource', err.statusCode || 400, {
        existingId: err.existingId,
      });
    }
  }

  static async import(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { url, projectIds, collectionIds, tags } = req.body;
      const resource = await ResourceService.importFromUrl(userId, url, projectIds, collectionIds, tags);
      return sendSuccess(res, resource, 'Resource imported successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to import resource', err.statusCode || 400, {
        existingId: err.existingId,
      });
    }
  }

  static async checkDuplicate(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const rawUrl = req.query.url as string;
      if (!rawUrl || typeof rawUrl !== 'string') {
        return sendSuccess(res, { isDuplicate: false });
      }
      const normalized = normalizeUrl(rawUrl);
      const existing = await Resource.findOne({
        userId,
        normalizedUrl: normalized,
        status: { $ne: 'trashed' },
      });
      if (existing) {
        return sendSuccess(res, {
          isDuplicate: true,
          existing: {
            _id: existing._id,
            title: existing.title,
            type: existing.type,
            createdAt: existing.createdAt,
          },
        });
      }
      return sendSuccess(res, { isDuplicate: false });
    } catch (err: any) {
      return sendError(res, err.message || 'Error checking duplicate URL', 500);
    }
  }

  static async fetchMetadata(req: Request, res: Response) {
    try {
      const rawUrl = req.query.url as string;
      if (!rawUrl) {
        return sendError(res, 'URL query parameter is required', 400);
      }
      const userId = req.user!.userId;

      // Fetch user's existing categories and established tags
      const [userCategories, userTags] = await Promise.all([
        Collection.find({ userId }).select('_id name color'),
        Resource.distinct('tags', { userId, status: 'active' }),
      ]);

      const extracted = await MetadataService.extract(rawUrl, {
        userCategories: userCategories.map((c) => ({
          _id: c._id.toString(),
          name: c.name,
          color: c.color,
        })),
        userExistingTags: (userTags || []) as string[],
      });

      return sendSuccess(res, extracted, 'Metadata extracted');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to extract metadata', 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const resource = await ResourceService.getById(userId, resourceId);
      return sendSuccess(res, resource, 'Resource details retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Resource not found', 404);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const updated = await ResourceService.update(userId, resourceId, req.body);
      return sendSuccess(res, updated, 'Resource updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update resource', err.statusCode || 400);
    }
  }

  static async moveToTrash(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const resource = await ResourceService.moveToTrash(userId, resourceId);
      return sendSuccess(res, resource, 'Resource moved to trash. It will be permanently removed after 30 days.');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to trash resource', 400);
    }
  }

  static async toggleFavourite(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const resource = await ResourceService.toggleFavourite(userId, resourceId);
      return sendSuccess(res, resource, resource.isFavourite ? 'Added to favourites' : 'Removed from favourites');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update favourite status', 400);
    }
  }

  static async archive(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const resource = await ResourceService.archive(userId, resourceId);
      return sendSuccess(res, resource, resource.status === 'archived' ? 'Resource archived' : 'Resource unarchived');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to archive resource', 400);
    }
  }

  static async restore(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const resource = await ResourceService.restore(userId, resourceId);
      return sendSuccess(res, resource, 'Resource restored from trash');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to restore resource', 400);
    }
  }

  static async deletePermanently(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      await ResourceService.deletePermanently(userId, resourceId);
      return sendSuccess(res, null, 'Resource permanently deleted');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete resource', 400);
    }
  }

  static async listTrash(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await ResourceService.list({
        userId,
        status: 'trashed',
        ...req.query as any,
      });
      return sendSuccess(res, result.resources, 'Trash items retrieved', 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch trash', 500);
    }
  }

  static async emptyTrash(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await ResourceService.emptyTrash(userId);
      return sendSuccess(res, { count }, `Cleared ${count} items from trash`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to empty trash', 500);
    }
  }

  static async refreshMetadata(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { resourceId } = req.params;
      const updated = await ResourceService.refreshMetadata(userId, resourceId);
      return sendSuccess(res, updated, 'Metadata refreshed successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to refresh metadata', 400);
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const stats = await ResourceService.getStats(userId);
      return sendSuccess(res, stats, 'Resource statistics retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Error retrieving resource statistics', 500);
    }
  }

  static async getRecent(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const result = await ResourceService.list({
        userId,
        sortBy: 'recent',
        status: 'active',
        limit,
        page: 1,
      });
      return sendSuccess(res, result.resources, 'Recent resources retrieved', 200, {
        total: result.total,
        limit,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Error listing recent resources', 500);
    }
  }

  static async getFavourites(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 50));
      const result = await ResourceService.list({
        userId,
        isFavourite: true,
        status: 'active',
        limit,
        page: 1,
      });
      return sendSuccess(res, result.resources, 'Favourite resources retrieved', 200, {
        total: result.total,
        limit,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Error listing favourite resources', 500);
    }
  }
}
