import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  color: string;
  type: 'category' | 'collection';
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      default: '#3b82f6', // Clean vibrant accent
      trim: true,
    },
    type: {
      type: String,
      enum: ['category', 'collection'],
      default: 'category',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ userId: 1, type: 1, name: 1 });

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
