import { Request, Response } from 'express';
import { ProjectService } from './project.service';
import { sendSuccess, sendError } from '../../utils/apiResponse';

export class ProjectController {
  static async list(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const projects = await ProjectService.list(userId);
      return sendSuccess(res, projects, 'Projects retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Error listing projects', 500);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { projectId } = req.params;
      const data = await ProjectService.getById(userId, projectId);
      return sendSuccess(res, data, 'Project details retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Project not found', 404);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const project = await ProjectService.create(userId, req.body);
      return sendSuccess(res, project, 'Project created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Error creating project', 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { projectId } = req.params;
      const project = await ProjectService.update(userId, projectId, req.body);
      return sendSuccess(res, project, 'Project updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Error updating project', 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { projectId } = req.params;
      await ProjectService.delete(userId, projectId);
      return sendSuccess(res, null, 'Project deleted successfully. Associated resources have been retained.');
    } catch (err: any) {
      return sendError(res, err.message || 'Error deleting project', 400);
    }
  }
}
