import mongoose from 'mongoose';
import { Resource, IResource, ResourceType, ResourceStatus } from './resource.model';
import { Project } from '../projects/project.model';
import { Collection } from '../collections/collection.model';
import { normalizeUrl, MetadataService } from './metadata.service';

export interface CreateResourceDTO {
  type: ResourceType;
  title: string;
  url?: string;
  description?: string;
  tags?: string[];
  projectIds?: string[];
  collectionIds?: string[];
  notes?: string;
  metadata?: Record<string, any>;
  previewImage?: string;
  favicon?: string;
  isFavourite?: boolean;
}

export interface ListResourcesParams {
  userId: string;
  type?: ResourceType;
  status?: ResourceStatus;
  isFavourite?: boolean;
  projectId?: string;
  collectionId?: string;
  tag?: string;
  search?: string;
  sortBy?: 'recent' | 'oldest' | 'title_asc' | 'title_desc';
  page?: number;
  limit?: number;
}

export class ResourceService {
  /**
   * Validates project and collection IDs belong to the user
   */
  private static async validateAssociations(userId: string, projectIds?: string[], collectionIds?: string[]) {
    if (projectIds && projectIds.length > 0) {
      const validProjects = await Project.countDocuments({
        _id: { $in: projectIds },
        userId,
      });
      if (validProjects !== projectIds.length) {
        throw new Error('One or more selected projects do not exist or belong to another user.');
      }
    }

    if (collectionIds && collectionIds.length > 0) {
      const validCollections = await Collection.countDocuments({
        _id: { $in: collectionIds },
        userId,
      });
      if (validCollections !== collectionIds.length) {
        throw new Error('One or more selected collections do not exist or belong to another user.');
      }
    }
  }

  static async create(userId: string, data: CreateResourceDTO) {
    const normalized = data.url ? normalizeUrl(data.url) : '';

    // Per-user duplicate check
    if (normalized) {
      const existing = await Resource.findOne({
        userId,
        normalizedUrl: normalized,
        status: { $ne: 'trashed' },
      });
      if (existing) {
        const err: any = new Error(`A resource with this URL already exists: "${existing.title}".`);
        err.statusCode = 409;
        err.existingId = existing._id;
        throw err;
      }
    }

    await this.validateAssociations(userId, data.projectIds, data.collectionIds);

    const tags = (data.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean);

    const resource = await Resource.create({
      userId,
      type: data.type,
      title: data.title.trim(),
      url: data.url ? data.url.trim() : '',
      normalizedUrl: normalized,
      description: data.description || '',
      tags: Array.from(new Set(tags)),
      projectIds: data.projectIds || [],
      collectionIds: data.collectionIds || [],
      notes: data.notes || '',
      metadata: data.metadata || {},
      previewImage: data.previewImage || '',
      favicon: data.favicon || '',
      isFavourite: Boolean(data.isFavourite),
      status: 'active',
    });

    return resource;
  }

  static async importFromUrl(userId: string, url: string, projectIds?: string[], collectionIds?: string[], customTags?: string[]) {
    const normalized = normalizeUrl(url);

    // Duplicate check
    const existing = await Resource.findOne({
      userId,
      normalizedUrl: normalized,
      status: { $ne: 'trashed' },
    });
    if (existing) {
      const err: any = new Error(`This URL has already been saved as "${existing.title}".`);
      err.statusCode = 409;
      err.existingId = existing._id;
      throw err;
    }

    await this.validateAssociations(userId, projectIds, collectionIds);

    // Extract metadata
    const extracted = await MetadataService.extract(url);

    const tags = Array.from(
      new Set(
        [
          ...(customTags || []),
          ...(extracted.metadata?.topics || []),
          extracted.metadata?.language,
        ]
          .filter(Boolean)
          .map((t: string) => t.trim().toLowerCase())
      )
    );

    const resource = await Resource.create({
      userId,
      type: extracted.type || 'development',
      title: extracted.title || normalized,
      url,
      normalizedUrl: normalized,
      description: extracted.description || '',
      tags,
      projectIds: projectIds || [],
      collectionIds: collectionIds || [],
      notes: '',
      metadata: extracted.metadata || {},
      previewImage: extracted.previewImage || '',
      favicon: extracted.favicon || '',
      status: 'active',
      isFavourite: false,
    });

    return resource;
  }

  static async list(params: ListResourcesParams) {
    const {
      userId,
      type,
      status = 'active',
      isFavourite,
      projectId,
      collectionId,
      tag,
      search,
      sortBy = 'recent',
      page = 1,
      limit = 20,
    } = params;

    const query: any = { userId, status };

    if (type) query.type = type;
    if (isFavourite !== undefined) query.isFavourite = isFavourite;
    if (projectId) query.projectIds = projectId;
    if (collectionId) query.collectionIds = collectionId;
    if (tag) query.tags = tag.toLowerCase();

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
        { url: { $regex: q, $options: 'i' } },
      ];
    }

    // Sorting
    let sort: any = { createdAt: -1 };
    if (sortBy === 'oldest') sort = { createdAt: 1 };
    if (sortBy === 'title_asc') sort = { title: 1 };
    if (sortBy === 'title_desc') sort = { title: -1 };

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('projectIds', 'name imageUrl')
        .populate('collectionIds', 'name color'),
      Resource.countDocuments(query),
    ]);

    return {
      resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getById(userId: string, id: string) {
    const resource = await Resource.findOne({ _id: id, userId })
      .populate('projectIds', 'name imageUrl description')
      .populate('collectionIds', 'name color description');
    if (!resource) {
      throw new Error('Resource not found.');
    }
    return resource;
  }

  static async update(userId: string, id: string, updates: Partial<CreateResourceDTO> & { status?: ResourceStatus }) {
    const resource = await Resource.findOne({ _id: id, userId });
    if (!resource) {
      throw new Error('Resource not found.');
    }

    if (updates.url && updates.url !== resource.url) {
      const normalized = normalizeUrl(updates.url);
      const duplicate = await Resource.findOne({
        _id: { $ne: id },
        userId,
        normalizedUrl: normalized,
        status: { $ne: 'trashed' },
      });
      if (duplicate) {
        const err: any = new Error(`Another resource with this URL already exists: "${duplicate.title}".`);
        err.statusCode = 409;
        throw err;
      }
      resource.url = updates.url;
      resource.normalizedUrl = normalized;
    }

    await this.validateAssociations(userId, updates.projectIds, updates.collectionIds);

    if (updates.title !== undefined) resource.title = updates.title.trim();
    if (updates.type !== undefined) resource.type = updates.type;
    if (updates.description !== undefined) resource.description = updates.description.trim();
    if (updates.tags !== undefined) {
      resource.tags = Array.from(new Set(updates.tags.map((t) => t.trim().toLowerCase()).filter(Boolean)));
    }
    if (updates.projectIds !== undefined) resource.projectIds = updates.projectIds.map((p) => new mongoose.Types.ObjectId(p));
    if (updates.collectionIds !== undefined) resource.collectionIds = updates.collectionIds.map((c) => new mongoose.Types.ObjectId(c));
    if (updates.notes !== undefined) resource.notes = updates.notes;
    if (updates.metadata !== undefined) resource.metadata = { ...resource.metadata, ...updates.metadata };
    if (updates.previewImage !== undefined) resource.previewImage = updates.previewImage;
    if (updates.favicon !== undefined) resource.favicon = updates.favicon;
    if (updates.isFavourite !== undefined) resource.isFavourite = updates.isFavourite;
    if (updates.status !== undefined) {
      resource.status = updates.status;
      if (updates.status === 'trashed') {
        resource.trashedAt = new Date();
      } else {
        resource.trashedAt = null;
      }
    }

    await resource.save();
    return resource;
  }

  static async toggleFavourite(userId: string, id: string) {
    const resource = await Resource.findOne({ _id: id, userId });
    if (!resource) throw new Error('Resource not found.');

    resource.isFavourite = !resource.isFavourite;
    await resource.save();
    return resource;
  }

  static async archive(userId: string, id: string) {
    const resource = await Resource.findOne({ _id: id, userId });
    if (!resource) throw new Error('Resource not found.');

    resource.status = resource.status === 'archived' ? 'active' : 'archived';
    await resource.save();
    return resource;
  }

  static async moveToTrash(userId: string, id: string) {
    const resource = await Resource.findOne({ _id: id, userId });
    if (!resource) throw new Error('Resource not found.');

    resource.status = 'trashed';
    resource.trashedAt = new Date();
    await resource.save();
    return resource;
  }

  static async restore(userId: string, id: string) {
    const resource = await Resource.findOne({ _id: id, userId, status: 'trashed' });
    if (!resource) throw new Error('Resource not found in trash.');

    resource.status = 'active';
    resource.trashedAt = null;
    await resource.save();
    return resource;
  }

  static async deletePermanently(userId: string, id: string) {
    const resource = await Resource.findOneAndDelete({ _id: id, userId, status: 'trashed' });
    if (!resource) throw new Error('Resource not found in trash.');
    return resource;
  }

  static async emptyTrash(userId: string) {
    const result = await Resource.deleteMany({ userId, status: 'trashed' });
    return result.deletedCount;
  }

  /**
   * Refreshes metadata for a saved resource
   */
  static async refreshMetadata(userId: string, id: string) {
    const resource = await Resource.findOne({ _id: id, userId });
    if (!resource || !resource.url) {
      throw new Error('Resource not found or has no URL to refresh.');
    }

    const extracted = await MetadataService.extract(resource.url);
    if (extracted.previewImage) resource.previewImage = extracted.previewImage;
    if (extracted.favicon) resource.favicon = extracted.favicon;
    if (extracted.metadata && Object.keys(extracted.metadata).length > 0) {
      resource.metadata = { ...resource.metadata, ...extracted.metadata };
    }
    await resource.save();
    return resource;
  }

  /**
   * 30-day retention cleanup for trash
   */
  static async cleanupExpiredTrash(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Resource.deleteMany({
      status: 'trashed',
      trashedAt: { $lt: thirtyDaysAgo },
    });
    return result.deletedCount;
  }
}
