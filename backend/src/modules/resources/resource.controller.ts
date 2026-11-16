import { Request, Response } from 'express';
import { ResourceService } from './resource.service';
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
}
