import { Request, Response } from 'express';
import { SearchService } from './search.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class SearchController {
  static async search(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const {
        q,
        type,
        tag,
        projectId,
        collectionId,
        status,
        isFavourite,
        sortBy,
        page,
        limit,
      } = req.query as any;

      const result = await SearchService.search({
        userId,
        q: q ? String(q) : undefined,
        type: type ? (type as any) : undefined,
        tag: tag ? String(tag) : undefined,
        projectId: projectId ? String(projectId) : undefined,
        collectionId: collectionId ? String(collectionId) : undefined,
        status: status ? String(status) : 'active',
        isFavourite: isFavourite === 'true' ? true : isFavourite === 'false' ? false : undefined,
        sortBy: sortBy || 'recent',
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? Math.min(100, parseInt(String(limit), 10)) : 20,
      });

      return sendSuccess(res, result.resources, 'Search results retrieved', 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Error executing search', 500);
    }
  }
}
