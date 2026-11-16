import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, LayoutGrid, List } from 'lucide-react';
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
        <div className="w-8 h-8 border-2 border-[#1e3a2f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs text-[#8a8277]">Loading collection...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/collections"
          className="inline-flex items-center gap-1.5 text-xs text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>All Collections</span>
        </Link>
      </div>

      {/* Collection Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${collection.color}12`,
              borderColor: `${collection.color}30`,
              color: collection.color,
            }}
          >
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: collection.color }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#191715] dark:text-[#f5f2ec]">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-0.5">
                {collection.description}
              </p>
            )}
            <div className="text-xs font-mono text-[#8a8277] mt-1">
              {resources.length} saved {resources.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] p-0.5 shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]'
                : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]'
                : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Associated Resources List */}
      {resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
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
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ded8cb] dark:border-[#2f2c27] p-8">
          <p className="text-xs text-[#8a8277] mb-4">
            No resources associated with this collection yet.
          </p>
          <Button
            size="sm"
            onClick={() => {
              const addBtn = document.querySelector('header button:has(svg)') as HTMLButtonElement;
              if (addBtn) addBtn.click();
            }}
          >
            Add Resource to Collection
          </Button>
        </div>
      )}

      {/* Edit modal */}
      <EditResourceModal
        isOpen={editingResource !== null}
        resource={editingResource}
        projects={[]}
        collections={[collection]}
        onClose={() => setEditingResource(null)}
        onSuccess={() => fetchCollectionData()}
      />

      {/* Delete modal */}
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
