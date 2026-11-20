import { eq, and, sql, desc, ne, inArray } from 'drizzle-orm';
import { db } from '../../db';
import { collections, collectionResources, resources, resourceTags, projectResources, projects } from '../../db/schema';
import { formatCollection, formatResource, formatProject } from '../../utils/formatters';

export class CollectionService {
  static async list(userId: string, type?: string) {
    const conditions = [eq(collections.userId, userId)];

    if (type === 'collection') {
      conditions.push(eq(collections.type, 'collection'));
    } else if (type === 'category') {
      conditions.push(eq(collections.type, 'category'));
    }

    const items = await db
      .select()
      .from(collections)
      .where(and(...conditions))
      .orderBy(desc(collections.createdAt));

    // Aggregate active resource counts per collection for this user
    const counts = await db
      .select({
        collectionId: collectionResources.collectionId,
        count: sql<number>`count(distinct ${resources.id})::int`,
      })
      .from(collectionResources)
      .innerJoin(resources, eq(collectionResources.resourceId, resources.id))
      .where(and(eq(resources.userId, userId), eq(resources.status, 'active')))
      .groupBy(collectionResources.collectionId);

    const countMap = new Map<string, number>();
    for (const c of counts) {
      countMap.set(c.collectionId, c.count);
    }

    return items.map((col) => formatCollection(col, countMap.get(col.id) || 0));
  }

  static async getById(userId: string, collectionId: string) {
    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)));

    if (!collection) throw new Error('Collection not found.');

    // Fetch active resources assigned to this collection
    const resourceRows = await db
      .select({
        resource: resources,
      })
      .from(collectionResources)
      .innerJoin(resources, eq(collectionResources.resourceId, resources.id))
      .where(
        and(
          eq(collectionResources.collectionId, collectionId),
          eq(resources.userId, userId),
          eq(resources.status, 'active')
        )
      )
      .orderBy(desc(resources.createdAt));

    const resourceList = resourceRows.map((r) => r.resource);
    const populated = await populateResources(userId, resourceList);

    return {
      collection: formatCollection(collection, populated.length),
      resources: populated,
      resourceCount: populated.length,
    };
  }

  static async create(
    userId: string,
    data: { name: string; description?: string; color?: string; type?: 'category' | 'collection' }
  ) {
    const trimmedName = data.name.trim();
    const itemType = data.type === 'collection' ? 'collection' : 'category';

    const [existing] = await db
      .select()
      .from(collections)
      .where(
        and(
          eq(collections.userId, userId),
          eq(collections.type, itemType),
          eq(sql`LOWER(${collections.name})`, trimmedName.toLowerCase())
        )
      );

    if (existing) {
      const label = itemType === 'collection' ? 'collection' : 'category';
      const err: any = new Error(`A ${label} named "${trimmedName}" already exists.`);
      err.statusCode = 409;
      throw err;
    }

    const [created] = await db
      .insert(collections)
      .values({
        userId,
        name: trimmedName,
        description: data.description || '',
        color: data.color || '#3b82f6',
        type: itemType,
      })
      .returning();

    return formatCollection(created, 0);
  }

  static async update(
    userId: string,
    collectionId: string,
    data: { name?: string; description?: string; color?: string; type?: 'category' | 'collection' }
  ) {
    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)));

    if (!collection) throw new Error('Collection not found.');

    const itemType = data.type !== undefined ? data.type : collection.type || 'category';
    const updates: any = { updatedAt: new Date() };

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (trimmedName.toLowerCase() !== collection.name.toLowerCase()) {
        const [existing] = await db
          .select()
          .from(collections)
          .where(
            and(
              eq(collections.userId, userId),
              ne(collections.id, collectionId),
              eq(collections.type, itemType),
              eq(sql`LOWER(${collections.name})`, trimmedName.toLowerCase())
            )
          );

        if (existing) {
          const label = itemType === 'collection' ? 'collection' : 'category';
          const err: any = new Error(`A ${label} named "${trimmedName}" already exists.`);
          err.statusCode = 409;
          throw err;
        }
      }
      updates.name = trimmedName;
    }

    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.color !== undefined) updates.color = data.color.trim();
    if (data.type !== undefined) updates.type = data.type;

    const [updated] = await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, collectionId))
      .returning();

    return formatCollection(updated);
  }

  static async delete(userId: string, collectionId: string) {
    const [collection] = await db
      .select()
      .from(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, userId)));

    if (!collection) throw new Error('Collection not found.');

    // Delete collection: cascade will remove collection_resources, retaining the original resources
    await db
      .delete(collections)
      .where(eq(collections.id, collectionId));

    return formatCollection(collection);
  }
}

/**
 * Helper to populate tags, projects, and collections for a list of resources
 */
export async function populateResources(userId: string, resourceList: any[]) {
  if (resourceList.length === 0) return [];
  const resourceIds = resourceList.map((r) => r.id);

  // 1. Tags
  const tagRows = await db
    .select()
    .from(resourceTags)
    .where(inArray(resourceTags.resourceId, resourceIds));

  const tagMap = new Map<string, string[]>();
  for (const t of tagRows) {
    if (!tagMap.has(t.resourceId)) tagMap.set(t.resourceId, []);
    tagMap.get(t.resourceId)!.push(t.tag);
  }

  // 2. Projects
  const projRows = await db
    .select({
      resourceId: projectResources.resourceId,
      project: projects,
    })
    .from(projectResources)
    .innerJoin(projects, eq(projectResources.projectId, projects.id))
    .where(inArray(projectResources.resourceId, resourceIds));

  const projMap = new Map<string, any[]>();
  for (const pr of projRows) {
    if (!projMap.has(pr.resourceId)) projMap.set(pr.resourceId, []);
    projMap.get(pr.resourceId)!.push(formatProject(pr.project));
  }

  // 3. Collections
  const colRows = await db
    .select({
      resourceId: collectionResources.resourceId,
      collection: collections,
    })
    .from(collectionResources)
    .innerJoin(collections, eq(collectionResources.collectionId, collections.id))
    .where(inArray(collectionResources.resourceId, resourceIds));

  const colMap = new Map<string, any[]>();
  for (const cr of colRows) {
    if (!colMap.has(cr.resourceId)) colMap.set(cr.resourceId, []);
    colMap.get(cr.resourceId)!.push(formatCollection(cr.collection));
  }

  return resourceList.map((r) =>
    formatResource(
      r,
      tagMap.get(r.id) || [],
      projMap.get(r.id) || [],
      colMap.get(r.id) || []
    )
  );
}
