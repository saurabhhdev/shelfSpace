import { Resource, ResourceType } from '../resources/resource.model';
import { Collection } from '../collections/collection.model';

export interface GlobalSearchParams {
  userId: string;
  q?: string;
  type?: ResourceType;
  tag?: string;
  projectId?: string;
  collectionId?: string;
  status?: string;
  isFavourite?: boolean;
  sortBy?: 'recent' | 'relevance' | 'title_asc';
  page?: number;
  limit?: number;
}

export class SearchService {
  static async search(params: GlobalSearchParams) {
    const {
      userId,
      q,
      type,
      tag,
      projectId,
      collectionId,
      status = 'active',
      isFavourite,
      sortBy = 'recent',
      page = 1,
      limit = 20,
    } = params;

    const query: any = { userId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type) query.type = type;
    if (tag) query.tags = tag.toLowerCase();
    if (projectId) query.projectIds = projectId;
    if (collectionId) query.collectionIds = collectionId;
    if (isFavourite !== undefined) query.isFavourite = isFavourite;

    let sort: any = { createdAt: -1 };

    if (q && q.trim()) {
      const term = q.trim();
      const matchingCollections = await Collection.find({
        userId,
        name: { $regex: term, $options: 'i' },
      }).select('_id');
      const matchedCategoryIds = matchingCollections.map((c) => c._id);

      const orConditions: any[] = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { tags: { $regex: term, $options: 'i' } },
        { notes: { $regex: term, $options: 'i' } },
        { url: { $regex: term, $options: 'i' } },
      ];

      if (matchedCategoryIds.length > 0) {
        orConditions.push({ collectionIds: { $in: matchedCategoryIds } });
      }

      query.$or = orConditions;

      if (sortBy === 'relevance') {
        sort = { score: { $meta: 'textScore' }, createdAt: -1 };
      }
    }

    if (sortBy === 'title_asc') sort = { title: 1 };
    if (sortBy === 'recent') sort = { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      Resource.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('projectIds', 'name imageUrl')
        .populate('collectionIds', 'name color'),
      Resource.countDocuments(query),
    ]);

    return {
      resources,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
