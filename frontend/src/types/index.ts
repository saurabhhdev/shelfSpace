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

export interface User {
  _id: string;
  name: string;
  email: string;
  emailVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  _id: string;
  userAgent: string;
  ipAddress: string;
  lastActiveAt: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  userId: string;
  name: string;
  description: string;
  imageUrl?: string;
  resourceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  _id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  resourceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  _id: string;
  userId: string;
  type: ResourceType;
  title: string;
  url?: string;
  normalizedUrl?: string;
  description: string;
  tags: string[];
  projectIds: (string | Project)[];
  collectionIds: (string | Collection)[];
  notes: string;
  metadata: Record<string, any>;
  previewImage?: string;
  favicon?: string;
  status: ResourceStatus;
  isFavourite: boolean;
  trashedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  error?: any;
}
