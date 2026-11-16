import mongoose from 'mongoose';
import { Collection, ICollection } from './collection.model';
import { Resource } from '../resources/resource.model';

export class CollectionService {
  static async list(userId: string) {
    const collections = await Collection.find({ userId }).sort({ createdAt: -1 });

    // Aggregate resource count per collection for this user
    const counts = await Resource.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'active' } },
      { $unwind: '$collectionIds' },
      { $group: { _id: '$collectionIds', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

    return collections.map((col) => ({
      ...col.toObject(),
      resourceCount: countMap.get(col._id.toString()) || 0,
    }));
  }

  static async getById(userId: string, collectionId: string) {
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new Error('Collection not found.');

    const resources = await Resource.find({
      userId,
      collectionIds: collectionId,
      status: 'active',
    }).sort({ createdAt: -1 });

    return {
      collection,
      resources,
      resourceCount: resources.length,
    };
  }

  static async create(userId: string, data: { name: string; description?: string; color?: string }) {
    return Collection.create({
      userId,
      name: data.name.trim(),
      description: data.description || '',
      color: data.color || '#3b82f6',
    });
  }

  static async update(userId: string, collectionId: string, data: { name?: string; description?: string; color?: string }) {
    const collection = await Collection.findOne({ _id: collectionId, userId });
    if (!collection) throw new Error('Collection not found.');

    if (data.name !== undefined) collection.name = data.name.trim();
    if (data.description !== undefined) collection.description = data.description.trim();
    if (data.color !== undefined) collection.color = data.color.trim();

    await collection.save();
    return collection;
  }

  static async delete(userId: string, collectionId: string) {
    const collection = await Collection.findOneAndDelete({ _id: collectionId, userId });
    if (!collection) throw new Error('Collection not found.');

    // Safe deletion: remove collection association from resources, but RETAIN the resources
    await Resource.updateMany(
      { userId, collectionIds: collectionId },
      { $pull: { collectionIds: collectionId } }
    );

    return collection;
  }
}
