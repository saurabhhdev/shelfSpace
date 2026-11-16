import React, { useState, useEffect, useCallback } from 'react';
import { Star, LayoutGrid, List } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

export const FavouritesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFavourites = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/resources', {
        params: { isFavourite: true, status: 'active', limit: 50 },
      });
      if (res.data?.success) {
        setResources(res.data.data);
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
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch {
      fetchFavourites();
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/resources/${deletingId}`);
      setDeletingId(null);
      fetchFavourites();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
            <span>Favorites</span>
            <span>•</span>
            <span>{resources.length} starred</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5] mt-0.5">
            Starred Resources
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            Your most essential and frequently referenced links and bookmarks.
          </p>
        </div>

        <div className="flex rounded-lg border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] p-0.5 self-start sm:self-auto">
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

      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'space-y-2')}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-[#f7f7f5] dark:bg-[#18181c] animate-pulse border border-[#ececeb] dark:border-[#26262c]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
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
          <Star className="w-8 h-8 text-amber-500 fill-amber-500/20 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5] mb-1">
            No favorites yet
          </h3>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] max-w-sm mx-auto">
            Click the star icon on any resource card to pin it here for rapid access.
          </p>
        </div>
      )}

      {editingResource && (
        <EditResourceModal
          isOpen={editingResource !== null}
          resource={editingResource}
          projects={[]}
          collections={[]}
          onClose={() => setEditingResource(null)}
          onSuccess={() => fetchFavourites()}
        />
      )}

      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
