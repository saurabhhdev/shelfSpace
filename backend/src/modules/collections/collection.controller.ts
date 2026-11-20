import { Request, Response } from 'express';
import { CollectionService } from './collection.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class CollectionController {
  static async list(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const type = req.query.type as string | undefined;
      const collections = await CollectionService.list(userId, type);
      return sendSuccess(res, collections, 'Collections retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Error listing collections', 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { collectionId } = req.params;
      const data = await CollectionService.getById(userId, collectionId);
      return sendSuccess(res, data, 'Collection details retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Collection not found', 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const collection = await CollectionService.create(userId, req.body);
      return sendSuccess(res, collection, 'Collection created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Error creating collection', err.statusCode || 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { collectionId } = req.params;
      const collection = await CollectionService.update(userId, collectionId, req.body);
      return sendSuccess(res, collection, 'Collection updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Error updating collection', err.statusCode || 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { collectionId } = req.params;
      await CollectionService.delete(userId, collectionId);
      return sendSuccess(res, null, 'Collection deleted successfully. Associated resources have been retained.');
    } catch (err: any) {
      return sendError(res, err.message || 'Error deleting collection', 400);
    }
  }
}
