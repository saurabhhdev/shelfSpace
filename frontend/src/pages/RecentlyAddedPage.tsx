import React, { useState, useEffect, useCallback } from 'react';
import { Clock, LayoutGrid, List } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

export const RecentlyAddedPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/resources', {
        params: { sortBy: 'recent', limit: 30, status: 'active' },
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
    fetchRecent();
  }, [fetchRecent]);

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
      fetchRecent();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
            <span>Timeline</span>
            <span>•</span>
            <span>{resources.length} recent</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#fafafa] mt-0.5">
            Recently Added
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            Chronological timeline of your newest tools, repositories, and bookmarks.
          </p>
        </div>

        <div className="flex rounded-none border border-white/10 bg-[#0E0F10] p-0.5 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-none transition-colors cursor-pointer',
              viewMode === 'grid'
                ? 'bg-[#09AE5B] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-none transition-colors cursor-pointer',
              viewMode === 'list'
                ? 'bg-[#09AE5B] text-black font-semibold'
                : 'text-neutral-400 hover:text-white'
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
              className="h-36 rounded-none bg-[#121316] animate-pulse border border-white/[0.08]"
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
        <div className="py-16 text-center rounded-none border border-dashed border-white/10 p-8 bg-[#121316]">
          <Clock className="w-8 h-8 text-[#09AE5B] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#E5E5E5] mb-1">
            No recently added items
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Resources you save will automatically be catalogued here in chronological order.
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
          onSuccess={() => fetchRecent()}
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

