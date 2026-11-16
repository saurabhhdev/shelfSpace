import mongoose, { Document, Schema } from 'mongoose';

export type ResourceType = 'design' | 'ui' | 'development' | 'data' | 'learning' | 'personal';
export type ResourceStatus = 'active' | 'archived' | 'trashed';

export interface IResource extends Document {
  userId: mongoose.Types.ObjectId;
  type: ResourceType;
  title: string;
  url?: string;
  normalizedUrl?: string;
  description: string;
  tags: string[];
  projectIds: mongoose.Types.ObjectId[];
  collectionIds: mongoose.Types.ObjectId[];
  notes: string;
  metadata: Record<string, any>;
  previewImage?: string;
  favicon?: string;
  status: ResourceStatus;
  isFavourite: boolean;
  trashedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['design', 'ui', 'development', 'data', 'learning', 'personal'],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    normalizedUrl: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    projectIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    collectionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Collection',
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    previewImage: {
      type: String,
      default: '',
    },
    favicon: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'trashed'],
      default: 'active',
      index: true,
    },
    isFavourite: {
      type: Boolean,
      default: false,
      index: true,
    },
    trashedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast filtered lookups
ResourceSchema.index({ userId: 1, status: 1, createdAt: -1 });
ResourceSchema.index({ userId: 1, isFavourite: 1 });
ResourceSchema.index({ userId: 1, type: 1 });
ResourceSchema.index({ userId: 1, projectIds: 1 });
ResourceSchema.index({ userId: 1, collectionIds: 1 });
ResourceSchema.index({ userId: 1, normalizedUrl: 1 });

// Full text search index
ResourceSchema.index(
  {
    title: 'text',
    description: 'text',
    notes: 'text',
    tags: 'text',
  },
  {
    weights: {
      title: 10,
      tags: 5,
      description: 3,
      notes: 1,
    },
    name: 'ResourceTextSearch',
  }
);

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
