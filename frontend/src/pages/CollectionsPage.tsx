import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Plus, Layers, Edit2, Trash2 } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Collection } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

const PRESET_COLORS = [
  '#1e3a2f', // Forest Green
  '#2563eb', // Indigo Blue
  '#7c3aed', // Violet
  '#b45309', // Amber Warm
  '#0f766e', // Deep Teal
  '#be123c', // Deep Rose
  '#4338ca', // Royal
  '#57524b', // Charcoal Stone
];

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1e3a2f');
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
    setColor('#1e3a2f');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Collection) => {
    setEditingCollection(c);
    setName(c.name);
    setDescription(c.description || '');
    setColor(c.color || '#1e3a2f');
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
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
            ORGANIZATION
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec] mt-0.5">
            Collections
          </h1>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-1">
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
              className="h-36 rounded-xl bg-[#f5f2eb] dark:bg-[#201e1b] animate-pulse border border-[#ded8cb] dark:border-[#2f2c27]"
            />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div
              key={collection._id}
              className="group relative flex flex-col justify-between p-5 bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] rounded-xl hover:border-[#1e3a2f] dark:hover:border-[#387356] transition-all hover:shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: `${collection.color}12`,
                      borderColor: `${collection.color}30`,
                      color: collection.color,
                    }}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: collection.color }}
                    />
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    <button
                      onClick={() => openEditModal(collection)}
                      className="p-1 rounded text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] transition-colors cursor-pointer"
                      title="Edit collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCollection(collection)}
                      className="p-1 rounded text-[#8a8277] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/collections/${collection._id}`}
                  className="font-semibold text-base text-[#191715] dark:text-[#f5f2ec] hover:text-[#1e3a2f] dark:hover:text-[#86efac] block"
                >
                  {collection.name}
                </Link>

                {collection.description && (
                  <p className="text-xs text-[#57524b] dark:text-[#aba499] line-clamp-2 mt-1">
                    {collection.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-xs text-[#8a8277]">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Layers className="w-3.5 h-3.5" />
                  {collection.resourceCount || 0} saved {collection.resourceCount === 1 ? 'item' : 'items'}
                </span>

                <Link
                  to={`/collections/${collection._id}`}
                  className="text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium text-xs"
                >
                  Explore →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ded8cb] dark:border-[#2f2c27] p-8">
          <BookmarkCheck className="w-10 h-10 text-[#8a8277] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#191715] dark:text-[#f5f2ec] mb-1">
            No collections yet
          </h3>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] max-w-sm mx-auto mb-5">
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
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-xs text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/40">
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
            <label className="text-xs font-medium text-[#45403a] dark:text-[#aba499] block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-lg p-2.5 text-sm bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] text-[#191715] dark:text-[#f5f2ec] focus:outline-none focus:ring-2 focus:ring-[#1e3a2f]/20 focus:border-[#1e3a2f]"
              placeholder="What theme or purpose defines this collection?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#45403a] dark:text-[#aba499] block mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={cn(
                    'w-6 h-6 rounded-full border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer',
                    color === preset
                      ? 'ring-2 ring-[#1e3a2f] ring-offset-2 dark:ring-offset-[#191816] border-white'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#ded8cb] dark:border-[#2f2c27] flex justify-end gap-2">
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
