import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Collection } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

const MUTED_COLORS = [
  '#09AE5B', // Emerald
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#71717a', // Zinc
];

export const CollectionsPage: React.FC = () => {
  const { notify } = useNotification();
  const [categories, setCategories] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(MUTED_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Delete modal
  const [deletingCategory, setDeletingCategory] = useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setColor(MUTED_COLORS[0]);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Collection) => {
    setEditingCategory(c);
    setName(c.name);
    setColor(c.color || MUTED_COLORS[0]);
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        await apiClient.patch(`/collections/${editingCategory._id}`, {
          name: name.trim(),
          color,
        });
        notify('Category updated', 'success');
      } else {
        await apiClient.post('/collections', {
          name: name.trim(),
          color,
        });
        notify('Category created', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/collections/${deletingCategory._id}`);
      notify(`"${deletingCategory.name}" deleted. Resources retained.`, 'success');
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      notify('Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
            Categories
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Group your resources with simple categories ({categories.length} total).
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          size="sm"
          className="self-start sm:self-auto shrink-0"
        >
          New Category
        </Button>
      </div>

      {/* Clean List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-md bg-[#121316] animate-pulse border border-white/[0.06]"
            />
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="group flex items-center justify-between p-3.5 bg-[#121316] border border-white/[0.08] hover:border-white/20 rounded-md transition-colors"
            >
              <Link
                to={`/categories/${category._id}`}
                className="flex items-center gap-3 min-w-0 flex-1 pr-4"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: category.color || '#09AE5B' }}
                />
                <div className="min-w-0">
                  <span className="font-medium text-xs sm:text-sm text-[#EDEDED] group-hover:text-white transition-colors truncate block">
                    {category.name}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {category.resourceCount || 0} {category.resourceCount === 1 ? 'resource' : 'resources'}
                  </span>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Rename & edit color"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeletingCategory(category)}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <Link
                  to={`/categories/${category._id}`}
                  className="p-1.5 rounded-md text-neutral-500 group-hover:text-white transition-colors"
                  title="View resources"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316] space-y-3">
          <h3 className="text-sm font-medium text-[#EDEDED]">
            No categories yet
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Create simple categories to group and organize your saved developer tools and references.
          </p>
          <Button size="xs" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={openCreateModal}>
            New Category
          </Button>
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'New Category'}
        description="Categories only require a name and a color."
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4 font-sans">
          {error && (
            <div className="p-2.5 rounded-md bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div>
            <Input
              label="Category Name"
              placeholder="e.g. Tools, Frontend, Libraries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-2">
              Color
            </label>
            <div className="flex items-center gap-2">
              {MUTED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-transform cursor-pointer',
                    color === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#121316]'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingCategory}
        title="Delete Category?"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? All associated resources will be kept and marked as uncategorized.`}
        confirmText="Delete"
        onCancel={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CollectionsPage;
