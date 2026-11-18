import React, { useState, useEffect, useCallback } from 'react';
import { Flaticon } from '../components/ui/Flaticon';
import { apiClient } from '../api/client';
import type { Resource, Collection } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceModal } from '../components/resources/ResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

export const FavouritesPage: React.FC = () => {
  const { notify } = useNotification();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFavourites = useCallback(async () => {
    setIsLoading(true);
    try {
      const [res, catsRes] = await Promise.all([
        apiClient.get('/resources', {
          params: { isFavourite: true, status: 'active', limit: 100 },
        }),
        apiClient.get('/collections'),
      ]);
      if (res.data?.success) {
        setResources(res.data.data);
      }
      if (catsRes.data?.success) {
        setCategories(catsRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const handleToggleFavourite = async (id: string) => {
    try {
      await apiClient.patch(`/resources/${id}/favourite`);
      notify('Removed from favorites', 'success');
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch {
      notify('Failed to update favorite', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${deletingResource.id}`);
      notify(`"${deletingResource.name}" moved to trash`, 'success');
      setDeletingResource(null);
      fetchFavourites();
    } catch (e) {
      notify('Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
            Favorites
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Your starred resources for quick everyday access ({resources.length} total).
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-md border border-[#3E3E38] bg-[#1C1C1B] p-0.5 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-sm transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-white/[0.1] text-white'
                : 'text-neutral-400 hover:text-white'
            )}
            title="List view"
          >
            <Flaticon name="menu-burger" className="text-xs" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-sm transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white/[0.1] text-white'
                : 'text-neutral-400 hover:text-white'
            )}
            title="Grid view"
          >
            <Flaticon name="apps" className="text-xs" />
          </button>
        </div>
      </div>

      {/* Resource list / grid */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2')}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-md bg-[#1C1C1B] animate-pulse border border-[#3E3E38]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'space-y-2'
          )}
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
              onToggleFavourite={handleToggleFavourite}
              onDelete={(id, name) => setDeletingResource({ id, name })}
              onEdit={(res) => setEditingResource(res)}
            />
          ))}
        </div>
      ) : (
        <div className="py-14 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B]">
          <h3 className="text-sm font-medium text-[#FAF9F5] mb-1">
            No favorites yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Click the star icon on any resource across your library to pin it here for quick access.
          </p>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <ResourceModal
          isOpen={true}
          resource={editingResource}
          categories={categories}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchFavourites();
          }}
          onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingResource}
        title="Delete Resource?"
        message={`Are you sure you want to delete "${deletingResource?.name}"? You can restore it from trash within 30 days.`}
        confirmText="Delete"
        onCancel={() => setDeletingResource(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default FavouritesPage;
