import {
  pgTable,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import crypto from 'crypto';

export function generateId(): string {
  return crypto.randomUUID();
}

// 1. Users Table
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(generateId),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
    emailVerificationToken: varchar('email_verification_token', { length: 255 }),
    resetPasswordToken: varchar('reset_password_token', { length: 255 }),
    resetPasswordExpires: timestamp('reset_password_expires', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_email_idx').on(table.email),
  ]
);

// 2. Sessions Table
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(generateId),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userAgent: varchar('user_agent', { length: 500 }).default('Unknown Device').notNull(),
    ipAddress: varchar('ip_address', { length: 64 }).default('127.0.0.1').notNull(),
    isRevoked: boolean('is_revoked').default(false).notNull(),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_is_revoked_idx').on(table.isRevoked),
    index('sessions_expires_at_idx').on(table.expiresAt),
  ]
);

// 3. Projects Table
export const projects = pgTable(
  'projects',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(generateId),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description').default('').notNull(),
    imageUrl: text('image_url').default('').notNull(),
    isArchived: boolean('is_archived').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('projects_user_id_idx').on(table.userId),
    index('projects_user_archived_idx').on(table.userId, table.isArchived),
  ]
);

// 4. Collections Table (serves both Categories and Collections via type)
export const collections = pgTable(
  'collections',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(generateId),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description').default('').notNull(),
    color: varchar('color', { length: 32 }).default('#3b82f6').notNull(),
    type: varchar('type', { length: 20 }).default('category').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('collections_user_id_idx').on(table.userId),
    index('collections_user_type_idx').on(table.userId, table.type),
  ]
);

// 5. Resources Table
export const resources = pgTable(
  'resources',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(generateId),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 32 }).notNull(),
    title: varchar('title', { length: 300 }).notNull(),
    url: text('url').default('').notNull(),
    normalizedUrl: text('normalized_url').default('').notNull(),
    description: text('description').default('').notNull(),
    notes: text('notes').default('').notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    previewImage: text('preview_image').default('').notNull(),
    favicon: text('favicon').default('').notNull(),
    status: varchar('status', { length: 20 }).default('active').notNull(),
    isFavourite: boolean('is_favourite').default(false).notNull(),
    trashedAt: timestamp('trashed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('resources_user_status_created_idx').on(table.userId, table.status, table.createdAt),
    index('resources_user_favourite_idx').on(table.userId, table.isFavourite),
    index('resources_user_normalized_url_idx').on(table.userId, table.normalizedUrl),
    index('resources_user_type_idx').on(table.userId, table.type),
  ]
);

// 6. Junction: Project Resources (Many-to-Many)
export const projectResources = pgTable(
  'project_resources',
  {
    projectId: varchar('project_id', { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    resourceId: varchar('resource_id', { length: 36 })
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.resourceId] }),
    index('project_resources_resource_id_idx').on(table.resourceId),
  ]
);

// 7. Junction: Collection Resources (Many-to-Many)
export const collectionResources = pgTable(
  'collection_resources',
  {
    collectionId: varchar('collection_id', { length: 36 })
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    resourceId: varchar('resource_id', { length: 36 })
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.resourceId] }),
    index('collection_resources_resource_id_idx').on(table.resourceId),
  ]
);

// 8. Junction: Resource Tags
export const resourceTags = pgTable(
  'resource_tags',
  {
    resourceId: varchar('resource_id', { length: 36 })
      .notNull()
      .references(() => resources.id, { onDelete: 'cascade' }),
    tag: varchar('tag', { length: 100 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.resourceId, table.tag] }),
    index('resource_tags_tag_idx').on(table.tag),
  ]
);

// Drizzle Relations Declarations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  projects: many(projects),
  collections: many(collections),
  resources: many(resources),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  projectResources: many(projectResources),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  collectionResources: many(collectionResources),
}));

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  user: one(users, {
    fields: [resources.userId],
    references: [users.id],
  }),
  projectResources: many(projectResources),
  collectionResources: many(collectionResources),
  resourceTags: many(resourceTags),
}));

export const projectResourcesRelations = relations(projectResources, ({ one }) => ({
  project: one(projects, {
    fields: [projectResources.projectId],
    references: [projects.id],
  }),
  resource: one(resources, {
    fields: [projectResources.resourceId],
    references: [resources.id],
  }),
}));

export const collectionResourcesRelations = relations(collectionResources, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionResources.collectionId],
    references: [collections.id],
  }),
  resource: one(resources, {
    fields: [collectionResources.resourceId],
    references: [resources.id],
  }),
}));

export const resourceTagsRelations = relations(resourceTags, ({ one }) => ({
  resource: one(resources, {
    fields: [resourceTags.resourceId],
    references: [resources.id],
  }),
}));

// Inferred TypeScript Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
