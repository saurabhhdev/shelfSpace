import { eq, and, sql, desc, ilike, or, inArray } from 'drizzle-orm';
import { db } from '../../db';
import { projects, projectResources, resources } from '../../db/schema';
import { formatProject } from '../../utils/formatters';
import { populateResources } from '../collections/collection.service';

export interface ListProjectsFilter {
  search?: string;
  status?: 'active' | 'archived' | 'all';
}

export class ProjectService {
  static async list(userId: string, filter?: ListProjectsFilter) {
    const conditions = [eq(projects.userId, userId)];

    if (filter?.status === 'archived') {
      conditions.push(eq(projects.isArchived, true));
    } else if (filter?.status === 'active') {
      conditions.push(eq(projects.isArchived, false));
    }

    if (filter?.search && filter.search.trim()) {
      const q = `%${filter.search.trim()}%`;
      conditions.push(
        or(
          ilike(projects.name, q),
          ilike(projects.description, q)
        )!
      );
    }

    const projectItems = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt), desc(projects.createdAt));

    // Aggregate active resource count per project for this user
    const counts = await db
      .select({
        projectId: projectResources.projectId,
        count: sql<number>`count(distinct ${resources.id})::int`,
      })
      .from(projectResources)
      .innerJoin(resources, eq(projectResources.resourceId, resources.id))
      .where(and(eq(resources.userId, userId), eq(resources.status, 'active')))
      .groupBy(projectResources.projectId);

    const countMap = new Map<string, number>();
    for (const c of counts) {
      countMap.set(c.projectId, c.count);
    }

    return projectItems.map((p) => formatProject(p, countMap.get(p.id) || 0));
  }

  static async getById(userId: string, projectId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) throw new Error('Project not found.');

    const resourceRows = await db
      .select({
        resource: resources,
      })
      .from(projectResources)
      .innerJoin(resources, eq(projectResources.resourceId, resources.id))
      .where(
        and(
          eq(projectResources.projectId, projectId),
          eq(resources.userId, userId),
          eq(resources.status, 'active')
        )
      )
      .orderBy(desc(resources.createdAt));

    const resourceList = resourceRows.map((r) => r.resource);
    const populated = await populateResources(userId, resourceList);

    return {
      project: formatProject(project, populated.length),
      resources: populated,
      resourceCount: populated.length,
    };
  }

  static async create(userId: string, data: { name: string; description?: string; imageUrl?: string }) {
    const [created] = await db
      .insert(projects)
      .values({
        userId,
        name: data.name.trim(),
        description: data.description || '',
        imageUrl: data.imageUrl || '',
        isArchived: false,
      })
      .returning();

    return formatProject(created, 0);
  }

  static async update(
    userId: string,
    projectId: string,
    data: { name?: string; description?: string; imageUrl?: string; isArchived?: boolean }
  ) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) throw new Error('Project not found.');

    const updates: any = { updatedAt: new Date() };
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.imageUrl !== undefined) updates.imageUrl = data.imageUrl.trim();
    if (data.isArchived !== undefined) updates.isArchived = Boolean(data.isArchived);

    const [updated] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, projectId))
      .returning();

    return formatProject(updated);
  }

  static async toggleArchive(userId: string, projectId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) throw new Error('Project not found.');

    const [updated] = await db
      .update(projects)
      .set({
        isArchived: !project.isArchived,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return formatProject(updated);
  }

  static async delete(userId: string, projectId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) throw new Error('Project not found.');

    // Cascade delete on project_resources safely removes relationships, retaining the original resources
    await db
      .delete(projects)
      .where(eq(projects.id, projectId));

    return formatProject(project);
  }

  static async addResources(userId: string, projectId: string, resourceIds: string[]) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) throw new Error('Project not found.');

    const validIds = resourceIds.filter(Boolean);
    if (validIds.length === 0) {
      throw new Error('No valid resource IDs provided.');
    }

    // Verify all resources belong to user
    const userResources = await db
      .select({ id: resources.id })
      .from(resources)
      .where(and(eq(resources.userId, userId), inArray(resources.id, validIds)));

    let modifiedCount = 0;
    for (const res of userResources) {
      const resInsert = await db
        .insert(projectResources)
        .values({
          projectId: project.id,
          resourceId: res.id,
        })
        .onConflictDoNothing()
        .returning();
      if (resInsert.length > 0) modifiedCount++;
    }

    return {
      modifiedCount,
      projectId,
    };
  }

  static async removeResource(userId: string, projectId: string, resourceId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

    if (!project) throw new Error('Project not found.');

    await db
      .delete(projectResources)
      .where(
        and(
          eq(projectResources.projectId, projectId),
          eq(projectResources.resourceId, resourceId)
        )
      );

    return { success: true };
  }
}
