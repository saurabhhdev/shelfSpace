import { z } from 'zod';

const resourceTypeEnum = z.enum([
  'tools',
  'repositories',
  'components',
  'snippets',
  'design',
  'references',
  'ui',
  'development',
  'data',
  'learning',
  'personal',
]);

export const createResourceSchema = z.object({
  type: resourceTypeEnum,
  title: z.string().min(1, 'Title is required').max(300),
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  description: z.string().max(2000).optional().default(''),
  tags: z.array(z.string().min(1).max(50)).optional().default([]),
  projectIds: z.array(z.string()).optional().default([]),
  collectionIds: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
  metadata: z.record(z.any()).optional().default({}),
  previewImage: z.string().optional().default(''),
  favicon: z.string().optional().default(''),
  isFavourite: z.boolean().optional().default(false),
  allowDuplicate: z.boolean().optional().default(false),
});

export const updateResourceSchema = z.object({
  type: resourceTypeEnum.optional(),
  title: z.string().min(1).max(300).optional(),
  url: z.string().url().optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  projectIds: z.array(z.string()).optional(),
  collectionIds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  previewImage: z.string().optional(),
  favicon: z.string().optional(),
  isFavourite: z.boolean().optional(),
  status: z.enum(['active', 'archived', 'trashed']).optional(),
});

export const importResourceSchema = z.object({
  url: z.string().url('Please enter a valid URL to import'),
  projectIds: z.array(z.string()).optional().default([]),
  collectionIds: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export const listResourcesQuerySchema = z.object({
  type: resourceTypeEnum.optional(),
  status: z.enum(['active', 'archived', 'trashed']).optional().default('active'),
  isFavourite: z.string().transform((v) => v === 'true').optional(),
  projectId: z.string().optional(),
  collectionId: z.string().optional(),
  tag: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['recent', 'oldest', 'title_asc', 'title_desc']).optional().default('recent'),
  page: z.string().transform((v) => Math.max(1, parseInt(v, 10) || 1)).optional().default('1'),
  limit: z.string().transform((v) => Math.min(100, Math.max(1, parseInt(v, 10) || 20))).optional().default('20'),
});
