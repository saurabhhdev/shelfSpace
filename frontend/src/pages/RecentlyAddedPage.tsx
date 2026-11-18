import React, { useState, useEffect, useCallback } from 'react';
import { Flaticon } from '../components/ui/Flaticon';
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
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#FAF9F5]">
            Recently Added
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Chronological timeline of your newest tools, repositories, and bookmarks ({resources.length} total).
          </p>
        </div>

        <div className="flex rounded-md border border-[#3E3E38] bg-[#1C1C1B] p-0.5 self-start sm:self-auto">
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
        </div>
      </div>

      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2')}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-md bg-[#1C1C1B] animate-pulse border border-[#3E3E38]"
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
        <div className="py-16 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B]">
          <Flaticon name="clock" className="text-3xl text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-[#FAF9F5] mb-1">
            No recent additions
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Resources you save will automatically appear here ordered by date.
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
            fetchRecent();
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

export default RecentlyAddedPage;