import { eq, and, sql, desc, asc, ilike, or, inArray, ne, lt } from 'drizzle-orm';
import { db } from '../../db';
import {
  resources,
  resourceTags,
  projectResources,
  collectionResources,
  projects,
  collections,
} from '../../db/schema';
import { formatResource } from '../../utils/formatters';
import { populateResources } from '../collections/collection.service';
import { normalizeUrl, MetadataService } from './metadata.service';

export type ResourceType =
  | 'tools'
  | 'repositories'
  | 'components'
  | 'snippets'
  | 'design'
  | 'references'
  | 'ui'
  | 'development'
  | 'data'
  | 'learning'
  | 'personal';
export type ResourceStatus = 'active' | 'archived' | 'trashed';

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
  allowDuplicate?: boolean;
}

export interface ListResourcesParams {
  userId: string;
  type?: ResourceType;
  status?: ResourceStatus;
  isFavourite?: boolean;
  projectId?: string;
  collectionId?: string;
  categoryId?: string;
  category?: string;
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
      const validProjects = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.userId, userId), inArray(projects.id, projectIds)));

      if (validProjects.length !== projectIds.length) {
        throw new Error('One or more selected projects do not exist or belong to another user.');
      }
    }

    if (collectionIds && collectionIds.length > 0) {
      const validCollections = await db
        .select({ id: collections.id })
        .from(collections)
        .where(and(eq(collections.userId, userId), inArray(collections.id, collectionIds)));

      if (validCollections.length !== collectionIds.length) {
        throw new Error('One or more selected collections do not exist or belong to another user.');
      }
    }
  }

  static async create(userId: string, data: CreateResourceDTO) {
    const normalized = data.url ? normalizeUrl(data.url) : '';

    // Per-user duplicate check
    if (normalized && !data.allowDuplicate) {
      const [existing] = await db
        .select()
        .from(resources)
        .where(
          and(
            eq(resources.userId, userId),
            eq(resources.normalizedUrl, normalized),
            ne(resources.status, 'trashed')
          )
        );

      if (existing) {
        const err: any = new Error(`A resource with this URL already exists: "${existing.title}".`);
        err.statusCode = 409;
        err.existingId = existing.id;
        throw err;
      }
    }

    await this.validateAssociations(userId, data.projectIds, data.collectionIds);

    const tags = Array.from(
      new Set((data.tags || []).map((t) => t.trim().toLowerCase()).filter(Boolean))
    );

    const [created] = await db
      .insert(resources)
      .values({
        userId,
        type: data.type,
        title: data.title.trim(),
        url: data.url ? data.url.trim() : '',
        normalizedUrl: normalized,
        description: data.description || '',
        notes: data.notes || '',
        metadata: data.metadata || {},
        previewImage: data.previewImage || '',
        favicon: data.favicon || '',
        isFavourite: Boolean(data.isFavourite),
        status: 'active',
      })
      .returning();

    // Insert tags
    if (tags.length > 0) {
      await db
        .insert(resourceTags)
        .values(tags.map((tag) => ({ resourceId: created.id, tag })))
        .onConflictDoNothing();
    }

    // Insert project associations
    if (data.projectIds && data.projectIds.length > 0) {
      await db
        .insert(projectResources)
        .values(data.projectIds.map((projectId) => ({ projectId, resourceId: created.id })))
        .onConflictDoNothing();
    }

    // Insert collection associations
    if (data.collectionIds && data.collectionIds.length > 0) {
      await db
        .insert(collectionResources)
        .values(data.collectionIds.map((collectionId) => ({ collectionId, resourceId: created.id })))
        .onConflictDoNothing();
    }

    return formatResource(
      created,
      tags,
      data.projectIds || [],
      data.collectionIds || []
    );
  }

  static async importFromUrl(
    userId: string,
    url: string,
    projectIds?: string[],
    collectionIds?: string[],
    customTags?: string[]
  ) {
    const normalized = normalizeUrl(url);

    // Duplicate check
    const [existing] = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.userId, userId),
          eq(resources.normalizedUrl, normalized),
          ne(resources.status, 'trashed')
        )
      );

    if (existing) {
      const err: any = new Error(`This URL has already been saved as "${existing.title}".`);
      err.statusCode = 409;
      err.existingId = existing.id;
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

    const [created] = await db
      .insert(resources)
      .values({
        userId,
        type: extracted.type || 'development',
        title: extracted.title || normalized,
        url,
        normalizedUrl: normalized,
        description: extracted.description || '',
        notes: '',
        metadata: extracted.metadata || {},
        previewImage: extracted.previewImage || '',
        favicon: extracted.favicon || '',
        status: 'active',
        isFavourite: false,
      })
      .returning();

    // Insert tags
    if (tags.length > 0) {
      await db
        .insert(resourceTags)
        .values(tags.map((tag) => ({ resourceId: created.id, tag })))
        .onConflictDoNothing();
    }

    // Insert projects
    if (projectIds && projectIds.length > 0) {
      await db
        .insert(projectResources)
        .values(projectIds.map((projectId) => ({ projectId, resourceId: created.id })))
        .onConflictDoNothing();
    }

    // Insert collections
    if (collectionIds && collectionIds.length > 0) {
      await db
        .insert(collectionResources)
        .values(collectionIds.map((collectionId) => ({ collectionId, resourceId: created.id })))
        .onConflictDoNothing();
    }

    return formatResource(
      created,
      tags,
      data.projectIds || [],
      data.collectionIds || []
    );
  }

  static async list(params: ListResourcesParams) {
    const {
      userId,
      type,
      status = 'active',
      isFavourite,
      projectId,
      collectionId,
      categoryId,
      category,
      tag,
      search,
      sortBy = 'recent',
      page = 1,
      limit = 20,
    } = params;

    const conditions: any[] = [
      eq(resources.userId, userId),
      eq(resources.status, status),
    ];

    if (type) conditions.push(eq(resources.type, type));
    if (isFavourite !== undefined) conditions.push(eq(resources.isFavourite, isFavourite));

    if (projectId) {
      const matchingResourceIds = await db
        .select({ resourceId: projectResources.resourceId })
        .from(projectResources)
        .where(eq(projectResources.projectId, projectId));
      const ids = matchingResourceIds.map((m) => m.resourceId);
      if (ids.length === 0) {
        return { resources: [], total: 0, page, limit, totalPages: 1 };
      }
      conditions.push(inArray(resources.id, ids));
    }

    const targetCollection = collectionId || categoryId || category;
    if (targetCollection) {
      const matchingResourceIds = await db
        .select({ resourceId: collectionResources.resourceId })
        .from(collectionResources)
        .where(eq(collectionResources.collectionId, targetCollection));
      const ids = matchingResourceIds.map((m) => m.resourceId);
      if (ids.length === 0) {
        return { resources: [], total: 0, page, limit, totalPages: 1 };
      }
      conditions.push(inArray(resources.id, ids));
    }

    if (tag) {
      const matchingTagResourceIds = await db
        .select({ resourceId: resourceTags.resourceId })
        .from(resourceTags)
        .where(eq(resourceTags.tag, tag.toLowerCase()));
      const ids = matchingTagResourceIds.map((m) => m.resourceId);
      if (ids.length === 0) {
        return { resources: [], total: 0, page, limit, totalPages: 1 };
      }
      conditions.push(inArray(resources.id, ids));
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      const term = search.trim().toLowerCase();

      // Find matching collections/categories by name
      const matchingCols = await db
        .select({ id: collections.id })
        .from(collections)
        .where(and(eq(collections.userId, userId), ilike(collections.name, q)));

      const colIds = matchingCols.map((c) => c.id);
      let colResourceIds: string[] = [];
      if (colIds.length > 0) {
        const crRows = await db
          .select({ resourceId: collectionResources.resourceId })
          .from(collectionResources)
          .where(inArray(collectionResources.collectionId, colIds));
        colResourceIds = crRows.map((cr) => cr.resourceId);
      }

      // Find matching resources by tag
      const matchingTagRows = await db
        .select({ resourceId: resourceTags.resourceId })
        .from(resourceTags)
        .where(ilike(resourceTags.tag, q));
      const tagResourceIds = matchingTagRows.map((t) => t.resourceId);

      const searchOrs: any[] = [
        ilike(resources.title, q),
        ilike(resources.description, q),
        ilike(resources.notes, q),
        ilike(resources.url, q),
      ];

      if (colResourceIds.length > 0) {
        searchOrs.push(inArray(resources.id, colResourceIds));
      }

      if (tagResourceIds.length > 0) {
        searchOrs.push(inArray(resources.id, tagResourceIds));
      }

      conditions.push(or(...searchOrs)!);
    }

    // Sorting
    let orderByClause = desc(resources.createdAt);
    if (sortBy === 'oldest') orderByClause = asc(resources.createdAt);
    if (sortBy === 'title_asc') orderByClause = asc(resources.title);
    if (sortBy === 'title_desc') orderByClause = desc(resources.title);

    const skip = (page - 1) * limit;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(resources)
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(limit)
        .offset(skip),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(resources)
        .where(and(...conditions)),
    ]);

    const total = totalResult[0]?.count || 0;
    const populated = await populateResources(userId, items);

    return {
      resources: populated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getById(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));

    if (!resource) {
      throw new Error('Resource not found.');
    }

    const [populated] = await populateResources(userId, [resource]);
    return populated;
  }

  static async update(
    userId: string,
    id: string,
    updates: Partial<CreateResourceDTO> & { status?: ResourceStatus }
  ) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));

    if (!resource) {
      throw new Error('Resource not found.');
    }

    const fieldsToUpdate: any = { updatedAt: new Date() };

    if (updates.url && updates.url !== resource.url) {
      const normalized = normalizeUrl(updates.url);
      const [duplicate] = await db
        .select()
        .from(resources)
        .where(
          and(
            ne(resources.id, id),
            eq(resources.userId, userId),
            eq(resources.normalizedUrl, normalized),
            ne(resources.status, 'trashed')
          )
        );

      if (duplicate) {
        const err: any = new Error(`Another resource with this URL already exists: "${duplicate.title}".`);
        err.statusCode = 409;
        throw err;
      }
      fieldsToUpdate.url = updates.url;
      fieldsToUpdate.normalizedUrl = normalized;
    }

    await this.validateAssociations(userId, updates.projectIds, updates.collectionIds);

    if (updates.title !== undefined) fieldsToUpdate.title = updates.title.trim();
    if (updates.type !== undefined) fieldsToUpdate.type = updates.type;
    if (updates.description !== undefined) fieldsToUpdate.description = updates.description.trim();
    if (updates.notes !== undefined) fieldsToUpdate.notes = updates.notes;
    if (updates.metadata !== undefined) fieldsToUpdate.metadata = { ...(resource.metadata as any), ...updates.metadata };
    if (updates.previewImage !== undefined) fieldsToUpdate.previewImage = updates.previewImage;
    if (updates.favicon !== undefined) fieldsToUpdate.favicon = updates.favicon;
    if (updates.isFavourite !== undefined) fieldsToUpdate.isFavourite = updates.isFavourite;

    if (updates.status !== undefined) {
      fieldsToUpdate.status = updates.status;
      if (updates.status === 'trashed') {
        fieldsToUpdate.trashedAt = new Date();
      } else {
        fieldsToUpdate.trashedAt = null;
      }
    }

    const [updated] = await db
      .update(resources)
      .set(fieldsToUpdate)
      .where(eq(resources.id, id))
      .returning();

    // Update tags if provided
    if (updates.tags !== undefined) {
      await db.delete(resourceTags).where(eq(resourceTags.resourceId, id));
      const cleanTags = Array.from(
        new Set(updates.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))
      );
      if (cleanTags.length > 0) {
        await db
          .insert(resourceTags)
          .values(cleanTags.map((tag) => ({ resourceId: id, tag })))
          .onConflictDoNothing();
      }
    }

    // Update project associations if provided
    if (updates.projectIds !== undefined) {
      await db.delete(projectResources).where(eq(projectResources.resourceId, id));
      if (updates.projectIds.length > 0) {
        await db
          .insert(projectResources)
          .values(updates.projectIds.map((projectId) => ({ projectId, resourceId: id })))
          .onConflictDoNothing();
      }
    }

    // Update collection associations if provided
    if (updates.collectionIds !== undefined) {
      await db.delete(collectionResources).where(eq(collectionResources.resourceId, id));
      if (updates.collectionIds.length > 0) {
        await db
          .insert(collectionResources)
          .values(updates.collectionIds.map((collectionId) => ({ collectionId, resourceId: id })))
          .onConflictDoNothing();
      }
    }

    const [populated] = await populateResources(userId, [updated]);
    return populated;
  }

  static async toggleFavourite(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));

    if (!resource) throw new Error('Resource not found.');

    const [updated] = await db
      .update(resources)
      .set({
        isFavourite: !resource.isFavourite,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();

    const [populated] = await populateResources(userId, [updated]);
    return populated;
  }

  static async archive(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));

    if (!resource) throw new Error('Resource not found.');

    const newStatus = resource.status === 'archived' ? 'active' : 'archived';
    const [updated] = await db
      .update(resources)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();

    const [populated] = await populateResources(userId, [updated]);
    return populated;
  }

  static async moveToTrash(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));

    if (!resource) throw new Error('Resource not found.');

    const [updated] = await db
      .update(resources)
      .set({
        status: 'trashed',
        trashedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();

    const [populated] = await populateResources(userId, [updated]);
    return populated;
  }

  static async restore(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.id, id),
          eq(resources.userId, userId),
          eq(resources.status, 'trashed')
        )
      );

    if (!resource) throw new Error('Resource not found in trash.');

    const [updated] = await db
      .update(resources)
      .set({
        status: 'active',
        trashedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();

    const [populated] = await populateResources(userId, [updated]);
    return populated;
  }

  static async deletePermanently(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.id, id),
          eq(resources.userId, userId),
          eq(resources.status, 'trashed')
        )
      );

    if (!resource) throw new Error('Resource not found in trash.');

    await db.delete(resources).where(eq(resources.id, id));

    return formatResource(resource);
  }

  static async emptyTrash(userId: string) {
    const deleted = await db
      .delete(resources)
      .where(and(eq(resources.userId, userId), eq(resources.status, 'trashed')))
      .returning();

    return deleted.length;
  }

  /**
   * Refreshes metadata for a saved resource
   */
  static async refreshMetadata(userId: string, id: string) {
    const [resource] = await db
      .select()
      .from(resources)
      .where(and(eq(resources.id, id), eq(resources.userId, userId)));

    if (!resource || !resource.url) {
      throw new Error('Resource not found or has no URL to refresh.');
    }

    const extracted = await MetadataService.extract(resource.url);
    const updates: any = { updatedAt: new Date() };

    if (extracted.previewImage) updates.previewImage = extracted.previewImage;
    if (extracted.favicon) updates.favicon = extracted.favicon;
    if (extracted.metadata && Object.keys(extracted.metadata).length > 0) {
      updates.metadata = { ...(resource.metadata as any), ...extracted.metadata };
    }

    const [updated] = await db
      .update(resources)
      .set(updates)
      .where(eq(resources.id, id))
      .returning();

    const [populated] = await populateResources(userId, [updated]);
    return populated;
  }

  /**
   * Aggregates live resource counts, totals, favorites, trash, categories, and projects
   */
  static async getStats(userId: string) {
    const [
      activeCountRes,
      favouriteCountRes,
      trashCountRes,
      categoryCountRes,
      projectCountRes,
      typeBreakdownRes,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(resources)
        .where(and(eq(resources.userId, userId), eq(resources.status, 'active'))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(resources)
        .where(
          and(
            eq(resources.userId, userId),
            eq(resources.status, 'active'),
            eq(resources.isFavourite, true)
          )
        ),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(resources)
        .where(and(eq(resources.userId, userId), eq(resources.status, 'trashed'))),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(collections)
        .where(eq(collections.userId, userId)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(eq(projects.userId, userId)),
      db
        .select({
          type: resources.type,
          count: sql<number>`count(*)::int`,
        })
        .from(resources)
        .where(and(eq(resources.userId, userId), eq(resources.status, 'active')))
        .groupBy(resources.type),
    ]);

    const byType: Record<string, number> = {
      tools: 0,
      repositories: 0,
      components: 0,
      snippets: 0,
      design: 0,
      references: 0,
    };

    for (const item of typeBreakdownRes) {
      if (item.type) {
        byType[item.type] = item.count;
      }
    }

    return {
      total: activeCountRes[0]?.count || 0,
      favorites: favouriteCountRes[0]?.count || 0,
      trash: trashCountRes[0]?.count || 0,
      categories: categoryCountRes[0]?.count || 0,
      projects: projectCountRes[0]?.count || 0,
      byType,
    };
  }

  /**
   * 30-day retention cleanup for trash
   */
  static async cleanupExpiredTrash(): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const deleted = await db
      .delete(resources)
      .where(and(eq(resources.status, 'trashed'), lt(resources.trashedAt, thirtyDaysAgo)))
      .returning();

    return deleted.length;
  }
}
