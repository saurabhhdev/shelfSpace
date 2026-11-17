import mongoose from 'mongoose';
import { Project, IProject } from './project.model';
import { Resource } from '../resources/resource.model';

export interface ListProjectsFilter {
  search?: string;
  status?: 'active' | 'archived' | 'all';
}

export class ProjectService {
  static async list(userId: string, filter?: ListProjectsFilter) {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };

    if (filter?.status === 'archived') {
      query.isArchived = true;
    } else if (filter?.status === 'active') {
      query.isArchived = { $ne: true };
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query).sort({ updatedAt: -1, createdAt: -1 });

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
    })
      .populate('collectionIds', 'name color')
      .populate('projectIds', 'name imageUrl')
      .sort({ createdAt: -1 });

    return {
      project: {
        ...project.toObject(),
        resourceCount: resources.length,
      },
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
      isArchived: false,
    });
  }

  static async update(
    userId: string,
    projectId: string,
    data: { name?: string; description?: string; imageUrl?: string; isArchived?: boolean }
  ) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    if (data.name !== undefined) project.name = data.name.trim();
    if (data.description !== undefined) project.description = data.description.trim();
    if (data.imageUrl !== undefined) project.imageUrl = data.imageUrl.trim();
    if (data.isArchived !== undefined) project.isArchived = Boolean(data.isArchived);

    await project.save();
    return project;
  }

  static async toggleArchive(userId: string, projectId: string) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    project.isArchived = !project.isArchived;
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

  static async addResources(userId: string, projectId: string, resourceIds: string[]) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    const objectIds = resourceIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length === 0) {
      throw new Error('No valid resource IDs provided.');
    }

    const result = await Resource.updateMany(
      { _id: { $in: objectIds }, userId },
      { $addToSet: { projectIds: project._id } }
    );

    return {
      modifiedCount: result.modifiedCount,
      projectId,
    };
  }

  static async removeResource(userId: string, projectId: string, resourceId: string) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found.');

    if (!mongoose.Types.ObjectId.isValid(resourceId)) {
      throw new Error('Invalid resource ID.');
    }

    await Resource.updateOne(
      { _id: resourceId, userId },
      { $pull: { projectIds: project._id } }
    );

    return {
      removed: true,
      resourceId,
      projectId,
    };
  }
}
