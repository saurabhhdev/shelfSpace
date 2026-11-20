import { eq, and, sql, desc, asc, ilike, or, inArray } from 'drizzle-orm';
import { db } from '../../db';
import {
  resources,
  resourceTags,
  projectResources,
  collectionResources,
  collections,
} from '../../db/schema';
import { ResourceType } from '../resources/resource.service';
import { populateResources } from '../collections/collection.service';

export interface GlobalSearchParams {
  userId: string;
  q?: string;
  type?: ResourceType;
  tag?: string;
  projectId?: string;
  collectionId?: string;
  status?: string;
  isFavourite?: boolean;
  sortBy?: 'recent' | 'relevance' | 'title_asc';
  page?: number;
  limit?: number;
}

export class SearchService {
  static async search(params: GlobalSearchParams) {
    const {
      userId,
      q,
      type,
      tag,
      projectId,
      collectionId,
      status = 'active',
      isFavourite,
      sortBy = 'recent',
      page = 1,
      limit = 20,
    } = params;

    const conditions: any[] = [eq(resources.userId, userId)];

    if (status && status !== 'all') {
      conditions.push(eq(resources.status, status));
    }

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

    if (collectionId) {
      const matchingResourceIds = await db
        .select({ resourceId: collectionResources.resourceId })
        .from(collectionResources)
        .where(eq(collectionResources.collectionId, collectionId));
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

    if (q && q.trim()) {
      const queryStr = `%${q.trim()}%`;

      // Find matching collections/categories by name
      const matchingCols = await db
        .select({ id: collections.id })
        .from(collections)
        .where(and(eq(collections.userId, userId), ilike(collections.name, queryStr)));

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
        .where(ilike(resourceTags.tag, queryStr));
      const tagResourceIds = matchingTagRows.map((t) => t.resourceId);

      const searchOrs: any[] = [
        ilike(resources.title, queryStr),
        ilike(resources.description, queryStr),
        ilike(resources.notes, queryStr),
        ilike(resources.url, queryStr),
      ];

      if (colResourceIds.length > 0) {
        searchOrs.push(inArray(resources.id, colResourceIds));
      }

      if (tagResourceIds.length > 0) {
        searchOrs.push(inArray(resources.id, tagResourceIds));
      }

      conditions.push(or(...searchOrs)!);
    }

    let orderByClause = desc(resources.createdAt);
    if (sortBy === 'title_asc') orderByClause = asc(resources.title);
    if (sortBy === 'recent') orderByClause = desc(resources.createdAt);

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
}
