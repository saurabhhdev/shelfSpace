import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowRight, ChevronDown, ChevronRight, Loader2, Globe, ExternalLink } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Collection, Resource } from '../types';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { useNotification } from '../context/NotificationContext';
import { getResourceTypeIcon } from '../lib/resourceTypes';
import { cn, formatRelativeTime } from '../lib/utils';

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

  // Expandable category states
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [categoryPreviewData, setCategoryPreviewData] = useState<
    Record<string, { resources: Resource[]; isLoading: boolean }>
  >({});

  const toggleExpandCategory = async (categoryId: string) => {
    const isExpanded = expandedCategoryIds.includes(categoryId);
    if (isExpanded) {
      setExpandedCategoryIds((prev) => prev.filter((id) => id !== categoryId));
    } else {
      setExpandedCategoryIds((prev) => [...prev, categoryId]);
      if (!categoryPreviewData[categoryId]) {
        setCategoryPreviewData((prev) => ({
          ...prev,
          [categoryId]: { resources: [], isLoading: true },
        }));
        try {
          const res = await apiClient.get('/resources', {
            params: { collectionId: categoryId, limit: 6, status: 'active' },
          });
          if (res.data?.success) {
            setCategoryPreviewData((prev) => ({
              ...prev,
              [categoryId]: { resources: res.data.data || [], isLoading: false },
            }));
          }
        } catch (err) {
          setCategoryPreviewData((prev) => ({
            ...prev,
            [categoryId]: { resources: [], isLoading: false },
          }));
        }
      }
    }
  };

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
      window.dispatchEvent(new CustomEvent('categories-updated'));
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
      window.dispatchEvent(new CustomEvent('categories-updated'));
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
          {categories.map((category) => {
            const isExpanded = expandedCategoryIds.includes(category._id);
            const preview = categoryPreviewData[category._id];

            return (
              <div
                key={category._id}
                className="bg-[#121316] border border-white/[0.08] hover:border-white/20 rounded-md transition-colors overflow-hidden"
              >
                {/* Header row */}
                <div className="group flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-4">
                    <button
                      type="button"
                      onClick={() => toggleExpandCategory(category._id)}
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                      title={isExpanded ? 'Collapse category' : 'Expand category'}
                    >
                      <ChevronRight
                        className={cn(
                          'w-4 h-4 transition-transform duration-150',
                          isExpanded && 'rotate-90 text-white'
                        )}
                      />
                    </button>

                    <Link
                      to={`/categories/${category._id}`}
                      className="flex items-center gap-3 min-w-0 flex-1 group/title"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: category.color || '#09AE5B' }}
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-xs sm:text-sm text-[#EDEDED] group-hover/title:text-white transition-colors truncate block">
                          {category.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {category.resourceCount || 0} {category.resourceCount === 1 ? 'resource' : 'resources'}
                        </span>
                      </div>
                    </Link>
                  </div>

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
                      className="p-1.5 rounded-md text-neutral-500 hover:text-white transition-colors"
                      title="View all resources"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-white/[0.06] bg-[#0E0F12] p-3.5 pt-3 animate-in fade-in duration-150">
                    {preview?.isLoading ? (
                      <div className="flex items-center justify-center py-6 text-neutral-400 text-xs gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#09AE5B]" />
                        <span>Loading resources...</span>
                      </div>
                    ) : preview && preview.resources.length > 0 ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {preview.resources.map((res) => {
                            const TypeIcon = getResourceTypeIcon(res.type);
                            let domain: string | null = null;
                            if (res.url) {
                              try {
                                domain = new URL(res.url).hostname.replace(/^www\./, '');
                              } catch {
                                domain = null;
                              }
                            }
                            return (
                              <div
                                key={res._id}
                                className="group/item flex items-center justify-between p-2 rounded bg-[#121316] border border-white/[0.05] hover:border-white/15 transition-colors"
                              >
                                <Link
                                  to={`/library/${res._id}`}
                                  className="flex items-center gap-2.5 min-w-0 flex-1 mr-2"
                                >
                                  <div className="w-6 h-6 rounded bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 text-neutral-400 group-hover/item:text-white">
                                    <TypeIcon className="w-3 h-3" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-medium text-neutral-200 group-hover/item:text-white truncate">
                                      {res.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono truncate">
                                      {domain && <span>{domain}</span>}
                                      {domain && <span>•</span>}
                                      <span>{formatRelativeTime(res.createdAt)}</span>
                                    </div>
                                  </div>
                                </Link>

                                {res.url && (
                                  <a
                                    href={res.url}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="p-1 rounded text-neutral-500 hover:text-white transition-colors shrink-0"
                                    title="Open link in new tab"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-2 flex justify-end">
                          <Link
                            to={`/categories/${category._id}`}
                            className="inline-flex items-center gap-1.5 text-xs text-[#09AE5B] hover:text-[#09AE5B]/80 font-medium transition-colors"
                          >
                            <span>
                              View all {category.resourceCount || preview.resources.length} resources in {category.name}
                            </span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-5 text-neutral-500 text-xs">
                        No resources saved in this category yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
