import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LayoutGrid, List, Plus } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Collection, Resource } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { Button } from '../components/ui/Button';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

export const CollectionDetailPage: React.FC = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCollectionData = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/collections/${collectionId}`);
      if (res.data?.success) {
        setCollection(res.data.data.collection);
        setResources(res.data.data.resources);
      }
    } catch (err) {
      console.error('Collection not found', err);
      navigate('/collections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId]);

  const handleToggleFavourite = async (id: string) => {
    setResources((prev) =>
      prev.map((r) => (r._id === id ? { ...r, isFavourite: !r.isFavourite } : r))
    );
    await apiClient.patch(`/resources/${id}/favourite`);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/resources/${deletingId}`);
      setDeletingId(null);
      fetchCollectionData();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !collection) {
    return (
      <div className="py-20 text-center">
        <div className="w-6 h-6 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[#8e8d8a]">Loading collection...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Collections</span>
        </Link>
      </div>

      {/* Collection Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${collection.color}15`,
              borderColor: `${collection.color}35`,
              color: collection.color,
            }}
          >
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: collection.color }}
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#2b2a28] dark:text-[#f4f4f5]">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-0.5">
                {collection.description}
              </p>
            )}
            <div className="text-[11px] font-mono text-[#8e8d8a] dark:text-[#71717a] mt-1">
              {resources.length} {resources.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] p-0.5 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-[#f0f0ee] dark:bg-[#25252d] text-[#191919] dark:text-white'
                : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-[#f0f0ee] dark:bg-[#25252d] text-[#191919] dark:text-white'
                : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
            )}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Associated Resources List */}
      {resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'
              : 'space-y-2'
          )}
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
              onToggleFavourite={handleToggleFavourite}
              onDelete={(id) => setDeletingId(id)}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ececeb] dark:border-[#26262c] p-8 bg-white dark:bg-[#18181c]">
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mb-4">
            No resources associated with this collection yet.
          </p>
          <Button
            variant="primary"
            pill
            size="xs"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
          >
            Add Resource to Collection
          </Button>
        </div>
      )}

      {/* Edit modal */}
      {editingResource && (
        <EditResourceModal
          isOpen={editingResource !== null}
          resource={editingResource}
          projects={[]}
          collections={[collection]}
          onClose={() => setEditingResource(null)}
          onSuccess={() => fetchCollectionData()}
        />
      )}

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
