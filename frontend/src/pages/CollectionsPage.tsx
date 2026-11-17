import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Plus, Layers, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Collection } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { cn } from '../lib/utils';

const PRESET_COLORS = [
  '#09AE5B', // Ossium Green
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#71717a', // Zinc
];

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#09AE5B');
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
    setColor('#09AE5B');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Collection) => {
    setEditingCollection(c);
    setName(c.name);
    setDescription(c.description || '');
    setColor(c.color || '#09AE5B');
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
            <span>Organization</span>
            <span>•</span>
            <span>{collections.length} collections</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5] mt-0.5">
            Resource Collections
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            Group resources thematically into curated stacks (e.g. Design Systems, Dev Tools, Color Palettes).
          </p>
        </div>

        <Button
          variant="primary"
          pill
          size="sm"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          className="text-xs h-8 px-4 font-medium shadow-xs"
        >
          New Collection
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-none bg-[#121316] animate-pulse border border-white/[0.08]"
            />
          ))}
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {collections.map((collection) => (
            <div
              key={collection._id}
              className="group relative flex flex-col justify-between p-4.5 bg-[#121316] border border-white/[0.08] rounded-none hover:border-[#09AE5B]/60 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-7 h-7 rounded-none flex items-center justify-center border border-white/10 bg-[#0E0F10]"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-none"
                      style={{ backgroundColor: collection.color || '#09AE5B' }}
                    />
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(collection)}
                      className="p-1 rounded-none text-neutral-400 hover:text-[#09AE5B] hover:bg-white/[0.06] transition-colors cursor-pointer"
                      title="Edit collection"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCollection(collection)}
                      className="p-1 rounded-none text-neutral-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <Link
                  to={`/collections/${collection._id}`}
                  className="font-semibold text-sm text-[#E5E5E5] hover:text-[#09AE5B] block transition-colors"
                >
                  {collection.name}
                </Link>

                {collection.description && (
                  <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                    {collection.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Layers className="w-3.5 h-3.5 text-[#09AE5B]" />
                  {collection.resourceCount || 0} {collection.resourceCount === 1 ? 'item' : 'items'}
                </span>

                <Link
                  to={`/collections/${collection._id}`}
                  className="text-xs text-neutral-400 hover:text-[#09AE5B] flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-none border border-dashed border-white/[0.12] p-8 bg-[#121316]">
          <BookmarkCheck className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#E5E5E5] mb-1">
            No collections yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            Create thematic collections to organize, cluster, and quickly retrieve your saved links.
          </p>
          <Button
            variant="primary"
            size="xs"
            onClick={openCreateModal}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create First Collection
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCollection ? 'Edit Collection' : 'New Collection'}
        description="Collections organize resources across multiple categories."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 rounded-none bg-rose-950/30 text-xs text-rose-400 border border-rose-900/40">
              {error}
            </div>
          )}

          <Input
            label="Collection Name"
            placeholder="e.g. Design Systems, Useful APIs, UI Components"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-1">
              Description (optional)
            </label>
            <textarea
              rows={2}
              className="w-full rounded-none p-2.5 text-xs bg-[#0E0F10] border border-white/10 text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]"
              placeholder="What theme or purpose defines this collection?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#E5E5E5] block mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  className={cn(
                    'w-6 h-6 rounded-none border transition-transform hover:scale-110 flex items-center justify-center cursor-pointer',
                    color === preset
                      ? 'ring-2 ring-[#09AE5B] ring-offset-2 ring-offset-[#121316] border-white'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#ececeb] dark:border-[#222227] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" pill isLoading={isSubmitting}>
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

