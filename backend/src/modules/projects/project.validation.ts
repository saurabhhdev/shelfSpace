import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(120),
  description: z.string().max(500).optional().default(''),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isArchived: z.boolean().optional(),
});

export const addResourcesToProjectSchema = z.object({
  resourceIds: z.array(z.string().min(1)).min(1, 'At least one resource is required'),
});
