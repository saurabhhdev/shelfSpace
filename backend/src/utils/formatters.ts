export function formatUser(u: any): any {
  if (!u) return null;
  return {
    _id: u.id,
    id: u.id,
    name: u.name,
    email: u.email,
    emailVerifiedAt: u.emailVerifiedAt,
    emailVerificationToken: u.emailVerificationToken || null,
    deletedAt: u.deletedAt,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

export function formatSession(s: any): any {
  if (!s) return null;
  return {
    _id: s.id,
    id: s.id,
    userId: s.userId,
    userAgent: s.userAgent,
    ipAddress: s.ipAddress,
    isRevoked: s.isRevoked,
    lastActiveAt: s.lastActiveAt,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function formatProject(p: any, resourceCount = 0): any {
  if (!p) return null;
  return {
    _id: p.id,
    id: p.id,
    userId: p.userId,
    name: p.name,
    description: p.description || '',
    imageUrl: p.imageUrl || '',
    isArchived: Boolean(p.isArchived),
    resourceCount: p.resourceCount !== undefined ? p.resourceCount : resourceCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export function formatCollection(c: any, resourceCount = 0): any {
  if (!c) return null;
  return {
    _id: c.id,
    id: c.id,
    userId: c.userId,
    name: c.name,
    description: c.description || '',
    color: c.color || '#3b82f6',
    type: c.type || 'category',
    resourceCount: c.resourceCount !== undefined ? c.resourceCount : resourceCount,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export function formatResource(
  r: any,
  tags: string[] = [],
  projects: any[] = [],
  collections: any[] = []
): any {
  if (!r) return null;
  return {
    _id: r.id,
    id: r.id,
    userId: r.userId,
    type: r.type,
    title: r.title,
    url: r.url || '',
    normalizedUrl: r.normalizedUrl || '',
    description: r.description || '',
    tags,
    projectIds: projects,
    collectionIds: collections,
    notes: r.notes || '',
    metadata: r.metadata || {},
    previewImage: r.previewImage || '',
    favicon: r.favicon || '',
    status: r.status || 'active',
    isFavourite: Boolean(r.isFavourite),
    trashedAt: r.trashedAt || null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}
