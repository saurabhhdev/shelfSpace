import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { apiClient } from '../api/client';
import { Resource } from '../types';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-red-500">
            Recycle Bin
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
            Trash
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Items moved to trash can be restored or permanently removed.
          </p>
        </div>

        {trashedResources.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsEmptyTrashOpen(true)}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Empty Trash
          </Button>
        )}
      </div>

      {/* 30-Day Retention Notice Banner */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <span className="font-semibold block mb-0.5">30-Day Auto Retention Policy</span>
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
              className="h-16 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-800/50"
            />
          ))}
        </div>
      ) : trashedResources.length > 0 ? (
        <div className="space-y-2">
          {trashedResources.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {item.title}
                  </span>
                  <Badge type={item.type} size="sm">
                    {item.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
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
                  className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  Delete Forever
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
          <Trash2 className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            Trash is empty
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            No items are currently in your trash. Deleted resources will appear here.
          </p>
        </div>
      )}

      {/* Empty Trash Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isEmptyTrashOpen}
        title="Empty Trash Completely?"
        message="This will permanently delete all items in trash. This action cannot be undone."
        confirmText="Empty All Trash"
        isPermanent
        isLoading={isEmptying}
        onCancel={() => setIsEmptyTrashOpen(false)}
        onConfirm={handleEmptyTrash}
      />

      {/* Delete Item Permanently Modal */}
      <DeleteConfirmModal
        isOpen={deletingItem !== null}
        title="Permanently Delete Item?"
        message={`"${deletingItem?.title}" will be permanently removed. This action cannot be undone.`}
        confirmText="Permanently Delete"
        isPermanent
        isLoading={isDeletingPermanent}
        onCancel={() => setDeletingItem(null)}
        onConfirm={handlePermanentDelete}
      />
    </div>
  );
};
