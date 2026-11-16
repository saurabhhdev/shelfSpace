import mongoose from 'mongoose';
import { Project, IProject } from './project.model';
import { Resource } from '../resources/resource.model';

export class ProjectService {
  static async list(userId: string) {
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });

    // Aggregate resource count per project for this user
    const counts = await Resource.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'active' } },
      { $unwind: '$projectIds' },
      { $group: { _id: '$projectIds', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    return projects.map((p) => ({
      ...p.toObject(),
      resourceCount: countMap.get(p._id.toString()) || 0,
    }));
  }

  static async getById(userId: string, projectId: string) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    const resources = await Resource.find({
      userId,
      projectIds: projectId,
      status: 'active',
    }).sort({ createdAt: -1 });

    return {
      project,
      resources,
      resourceCount: resources.length,
    };
  }

  static async create(userId: string, data: { name: string; description?: string; imageUrl?: string }) {
    return Project.create({
      userId,
      name: data.name.trim(),
      description: data.description || '',
      imageUrl: data.imageUrl || '',
    });
  }

  static async update(userId: string, projectId: string, data: { name?: string; description?: string; imageUrl?: string }) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    if (data.name !== undefined) project.name = data.name.trim();
    if (data.description !== undefined) project.description = data.description.trim();
    if (data.imageUrl !== undefined) project.imageUrl = data.imageUrl.trim();

    await project.save();
    return project;
  }

  static async delete(userId: string, projectId: string) {
    const project = await Project.findOneAndDelete({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    // Safe deletion: remove project association from resources, but RETAIN the resources
    await Resource.updateMany(
      { userId, projectIds: projectId },
      { $pull: { projectIds: projectId } }
    );

    return project;
  }
}
