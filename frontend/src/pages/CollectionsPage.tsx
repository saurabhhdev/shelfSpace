import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Plus, Layers, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { Collection } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ef4444', // Red
  '#64748b', // Slate
];

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete modal
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success) {
        setCollections(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch collections', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName('');
    setDescription('');
    setColor('#3b82f6');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Collection) => {
    setEditingCollection(c);
    setName(c.name);
    setDescription(c.description || '');
    setColor(c.color || '#3b82f6');
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (editingCollection) {
        await apiClient.patch(`/collections/${editingCollection._id}`, {
          name: name.trim(),
          description: description.trim(),
          color,
        });
      } else {
        await apiClient.post('/collections', {
          name: name.trim(),
          description: description.trim(),
          color,
        });
      }
      setIsModalOpen(false);
      fetchCollections();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCollection) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/collections/${deletingCollection._id}`);
      setDeletingCollection(null);
      fetchCollections();
    } catch (err) {
      console.error('Failed to delete collection', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Organization
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
            Collections
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Curate thematic groups of resources (e.g. Design Systems, Auth Tools, Boilerplates).
          </p>
        </div>

        <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          New Collection
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/50 animate-pulse border border-zinc-200/50 dark:border-zinc-800/50"
            />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div
              key={collection._id}
              className="group relative flex flex-col justify-between p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: `${collection.color}15`,
                      borderColor: `${collection.color}35`,
                      color: collection.color,
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collection.color }}
                    />
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(collection)}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Edit collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCollection(collection)}
                      className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/collections/${collection._id}`}
                  className="font-semibold text-base text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 block"
                >
                  {collection.name}
                </Link>

                {collection.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {collection.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  {collection.resourceCount || 0} saved {collection.resourceCount === 1 ? 'item' : 'items'}
                </span>

                <Link
                  to={`/collections/${collection._id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
                >
                  Explore →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-8">
          <BookmarkCheck className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            No collections yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
            Create topical collections to organize and rediscover your tools, icons, and libraries.
          </p>
          <Button size="sm" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Create First Collection
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCollection ? 'Edit Collection' : 'New Collection'}
        description="Collections tag and curate resources across multiple categories."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <Input
            label="Collection Name"
            placeholder="e.g. Awesome Icons or React Starter Kits"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg p-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="What theme or purpose defines this collection?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={cn(
                    'w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center',
                    color === preset
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 border-white'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingCollection ? 'Save Changes' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Collection Modal */}
      <DeleteConfirmModal
        isOpen={deletingCollection !== null}
        title="Delete Collection?"
        message={`Are you sure you want to delete "${deletingCollection?.name}"? All associated resources will be safely preserved in your library.`}
        confirmText="Delete Collection"
        onCancel={() => setDeletingCollection(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
