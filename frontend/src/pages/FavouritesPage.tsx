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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
            Favorites
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Your starred resources for fast everyday reference ({resources.length} total).
          </p>
        </div>

        <div className="flex rounded-md border border-white/[0.08] bg-[#121316] p-0.5 self-start sm:self-auto">
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
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
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
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2')}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-md bg-[#121316] animate-pulse border border-white/[0.06]"
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
              onDelete={(id) => setDeletingId(id)}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316]">
          <Star className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-[#EDEDED] mb-1">
            No favorite resources yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Click the star icon on any resource card in your library to pin it here.
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          isOpen={true}
          projects={[]}
          collections={[]}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchFavourites();
          }}
        />
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        title="Move Resource to Trash?"
        message="This resource will be moved to Trash. You can restore it anytime within 30 days."
        confirmText="Move to Trash"
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default FavouritesPage;