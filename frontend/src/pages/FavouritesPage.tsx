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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400">
            QUICK ACCESS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec] mt-0.5">
            Favourites
          </h1>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-1">
            Your most frequently referenced and starred developer resources.
          </p>
        </div>

        <div className="flex rounded-lg border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] p-0.5">
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-[#f5f2eb] dark:bg-[#201e1b] animate-pulse border border-[#ded8cb] dark:border-[#2f2c27]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
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
          <Star className="w-10 h-10 text-amber-500/40 fill-amber-500/10 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#191715] dark:text-[#f5f2ec] mb-1">
            No favourites yet
          </h3>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] max-w-sm mx-auto">
            Click the star icon on any resource card to pin it here for rapid access.
          </p>
        </div>
      )}

      <EditResourceModal
        isOpen={editingResource !== null}
        resource={editingResource}
        projects={[]}
        collections={[]}
        onClose={() => setEditingResource(null)}
        onSuccess={() => fetchFavourites()}
      />

      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
