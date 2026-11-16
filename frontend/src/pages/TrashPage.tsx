import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
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
          <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
            <span>Trash</span>
            <span>•</span>
            <span>{trashedResources.length} items</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5] mt-0.5">
            Recycle Bin
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            Items moved to trash can be restored anytime within the 30-day grace period.
          </p>
        </div>

        {trashedResources.length > 0 && (
          <Button
            variant="danger"
            size="xs"
            pill
            onClick={() => setIsEmptyTrashOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Empty Trash
          </Button>
        )}
      </div>

      {/* 30-Day Retention Notice Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold block mb-0.5">30-Day Auto Purge Policy</span>
          Resources residing in trash are permanently purged after 30 days. You can restore them to
          your active library anytime before the period expires.
        </div>
      </div>

      {/* Trash Items List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-[#f7f7f5] dark:bg-[#18181c] animate-pulse border border-[#ececeb] dark:border-[#26262c]"
            />
          ))}
        </div>
      ) : trashedResources.length > 0 ? (
        <div className="space-y-2">
          {trashedResources.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all shadow-2xs"
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5] truncate">
                    {item.title}
                  </span>
                  <Badge type={item.type} size="sm">
                    {item.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#8e8d8a] dark:text-[#71717a] mt-1 font-mono">
                  {item.trashedAt && (
                    <span>Trashed {formatRelativeTime(item.trashedAt)}</span>
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
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Restore
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setDeletingItem(item)}
                  className="text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  Purge
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ececeb] dark:border-[#26262c] p-8 bg-white dark:bg-[#18181c]">
          <Trash2 className="w-8 h-8 text-[#8e8d8a] mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5] mb-1">
            Trash is empty
          </h3>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] max-w-sm mx-auto">
            No items are currently in your trash. Deleted resources will appear here.
          </p>
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isEmptyTrashOpen}
        title="Empty Entire Trash?"
        message="This will permanently delete all resources currently in the trash bin. This action cannot be undone."
        confirmText="Empty Trash Forever"
        isPermanent
        isLoading={isEmptying}
        onCancel={() => setIsEmptyTrashOpen(false)}
        onConfirm={handleEmptyTrash}
      />

      {/* Single Item Permanent Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingItem !== null}
        title="Permanently Delete Resource?"
        message={`"${deletingItem?.title}" will be wiped permanently from the database. This cannot be recovered.`}
        confirmText="Purge Forever"
        isPermanent
        isLoading={isDeletingPermanent}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handlePermanentDelete}
      />
    </div>
  );
};
