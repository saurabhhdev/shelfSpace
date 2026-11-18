import React, { useState, useEffect, useCallback } from 'react';
import { Flaticon } from '../components/ui/Flaticon';
import { apiClient } from '../api/client';
import type { Resource } from '../types';
import { Button } from '../components/ui/Button';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { Badge } from '../components/ui/Badge';
import { formatRelativeTime } from '../lib/utils';

export const TrashPage: React.FC = () => {
  const [trashedResources, setTrashedResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Empty trash modal
  const [isEmptyTrashOpen, setIsEmptyTrashOpen] = useState(false);
  const [isEmptying, setIsEmptying] = useState(false);

  // Permanent delete single item modal
  const [deletingItem, setDeletingItem] = useState<Resource | null>(null);
  const [isDeletingPermanent, setIsDeletingPermanent] = useState(false);

  const fetchTrash = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/resources/trash');
      if (res.data?.success) {
        setTrashedResources(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  const handleRestore = async (id: string) => {
    try {
      await apiClient.patch(`/resources/${id}/restore`);
      setTrashedResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error('Failed to restore resource', err);
    }
  };

  const handlePermanentDelete = async () => {
    if (!deletingItem) return;
    setIsDeletingPermanent(true);
    try {
      await apiClient.delete(`/resources/${deletingItem._id}/permanent`);
      setDeletingItem(null);
      fetchTrash();
    } catch (err) {
      console.error('Failed to permanently delete', err);
    } finally {
      setIsDeletingPermanent(false);
    }
  };

  const handleEmptyTrash = async () => {
    setIsEmptying(true);
    try {
      await apiClient.delete('/resources/trash');
      setIsEmptyTrashOpen(false);
      fetchTrash();
    } catch (err) {
      console.error('Failed to empty trash', err);
    } finally {
      setIsEmptying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
            Trash
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Items in trash are automatically permanently removed after 30 days ({trashedResources.length} total).
          </p>
        </div>

        {trashedResources.length > 0 && (
          <Button
            variant="danger"
            size="xs"
            onClick={() => setIsEmptyTrashOpen(true)}
            leftIcon={<Flaticon name="trash" className="text-xs" />}
          >
            Empty Trash
          </Button>
        )}
      </div>

      {/* Trash Items List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-md bg-[#1C1C1B] animate-pulse border border-[#3E3E38]"
            />
          ))}
        </div>
      ) : trashedResources.length > 0 ? (
        <div className="space-y-2">
          {trashedResources.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3.5 rounded-md bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 transition-colors"
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs sm:text-sm text-[#FAF9F5] truncate">
                    {item.title}
                  </span>
                  <Badge type={item.type} size="sm">
                    {item.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 font-mono">
                  {item.trashedAt && (
                    <span>Deleted {formatRelativeTime(item.trashedAt)}</span>
                  )}
                  {item.url && <span className="truncate max-w-xs">{item.url}</span>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleRestore(item._id)}
                  leftIcon={<Flaticon name="refresh" className="text-xs" />}
                >
                  Restore
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setDeletingItem(item)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs"
                >
                  Delete Permanently
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B]">
          <Flaticon name="trash" className="text-3xl text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-[#FAF9F5] mb-1">
            Trash is empty
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Deleted resources will be kept here for 30 days before being permanently removed.
          </p>
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isEmptyTrashOpen}
        title="Empty Trash?"
        message="This will permanently delete all items currently in your trash. This action cannot be undone."
        confirmText="Empty Trash"
        isPermanent
        isLoading={isEmptying}
        onCancel={() => setIsEmptyTrashOpen(false)}
        onConfirm={handleEmptyTrash}
      />

      {/* Single Item Permanent Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingItem !== null}
        title="Permanently Delete Resource?"
        message={`"${deletingItem?.title}" will be permanently removed. This action cannot be undone.`}
        confirmText="Delete Permanently"
        isPermanent
        isLoading={isDeletingPermanent}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handlePermanentDelete}
      />
    </div>
  );
};

export default TrashPage;