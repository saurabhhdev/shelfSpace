import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flaticon } from '../components/ui/Flaticon';
import { apiClient } from '../api/client';
import type { Collection, Resource } from '../types';
import { Button, IconButton } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { CreateCollectionModal } from '../components/collections/CreateCollectionModal';
import { useNotification } from '../context/NotificationContext';
import { getResourceTypeIcon } from '../lib/resourceTypes';
import { cn, formatRelativeTime } from '../lib/utils';
import { CollectionRowSkeleton, LoadingInline } from '../components/ui/LoadingState';

const MUTED_COLORS = [
  '#D97757', // Terracotta (MX Icons)
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
  const location = useLocation();
  const isCollectionsRoute = location.pathname.startsWith('/collections');
  const currentType: 'category' | 'collection' = isCollectionsRoute ? 'collection' : 'category';

  const [categories, setCategories] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create modal (Pre-made + Custom)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalTab, setCreateModalTab] = useState<'premade' | 'custom'>('premade');

  // Edit existing modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Collection | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(MUTED_COLORS[0]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState('');

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
      const res = await apiClient.get('/collections', {
        params: { type: currentType },
      });
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
    const handleUpdate = () => fetchCategories();
    window.addEventListener('categories-updated', handleUpdate);
    return () => window.removeEventListener('categories-updated', handleUpdate);
  }, [location.pathname]);

  const openCreateModal = (tab: 'premade' | 'custom' = 'premade') => {
    setCreateModalTab(tab);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (c: Collection) => {
    setEditingCategory(c);
    setEditName(c.name);
    setEditColor(c.color || MUTED_COLORS[0]);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Category name is required.');
      return;
    }

    if (!editingCategory) return;
    setIsSubmittingEdit(true);
    setEditError('');

    try {
      await apiClient.patch(`/collections/${editingCategory._id}`, {
        name: editName.trim(),
        color: editColor,
      });
      notify('Category updated', 'success');
      setIsEditModalOpen(false);
      fetchCategories();
      window.dispatchEvent(new CustomEvent('categories-updated'));
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setIsSubmittingEdit(false);
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
          <h1 className="text-xl font-semibold tracking-tight text-[#FAF9F5]">
            {isCollectionsRoute ? 'Collections' : 'Categories'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isCollectionsRoute
              ? "Group resources around a topic or purpose."
              : "Classify resources by type or topic."}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => openCreateModal(isCollectionsRoute ? 'custom' : 'premade')}
          leftIcon={<Flaticon name="plus" className="text-xs" />}
          size="sm"
          className="self-start sm:self-auto shrink-0"
        >
          {isCollectionsRoute ? 'New Collection' : 'New Category'}
        </Button>
      </div>

      {/* Clean List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <CollectionRowSkeleton key={i} />
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
                className="bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 rounded-md transition-colors overflow-hidden"
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
                      <Flaticon
                        name="angle-small-right"
                        className={cn(
                          'text-xs transition-transform duration-150',
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
                        style={{ backgroundColor: category.color || '#D97757' }}
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-xs sm:text-sm text-[#FAF9F5] group-hover/title:text-white transition-colors truncate block">
                          {category.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          {category.resourceCount || 0} {category.resourceCount === 1 ? 'resource' : 'resources'}
                        </span>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <IconButton
                      onClick={() => openEditModal(category)}
                      variant="ghost"
                      size="sm"
                      title="Rename & edit color"
                      icon={<Flaticon name="pencil" className="text-xs" />}
                    />

                    <IconButton
                      onClick={() => setDeletingCategory(category)}
                      variant="danger"
                      size="sm"
                      title="Delete category"
                      icon={<Flaticon name="trash" className="text-xs" />}
                    />

                    <Link
                      to={`/categories/${category._id}`}
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all active:scale-[0.95]"
                      title="View all resources"
                    >
                      <Flaticon name="angle-small-right" className="text-xs" />
                    </Link>
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-[#3E3E38] bg-[#262624] p-3.5 pt-3 animate-in fade-in duration-150">
                    {preview?.isLoading ? (
                      <LoadingInline label="Loading resources..." className="py-6" />
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
                                className="group/item flex items-center justify-between p-2 rounded bg-[#1C1C1B] border border-[#3E3E38] hover:border-neutral-500 transition-colors"
                              >
                                <Link
                                  to={`/library/${res._id}`}
                                  className="flex items-center gap-2.5 min-w-0 flex-1 mr-2"
                                >
                                  <div className="w-6 h-6 rounded bg-[#262624] border border-[#3E3E38] flex items-center justify-center shrink-0">
                                    <TypeIcon className="w-3.5 h-3.5 text-neutral-400 group-hover/item:text-[#FAF9F5]" />
                                  </div>
                                  <div className="min-w-0 truncate">
                                    <div className="text-xs font-medium text-[#FAF9F5] group-hover/item:text-[#D97757] transition-colors truncate">
                                      {res.title}
                                    </div>
                                    {domain && (
                                      <div className="text-[10px] text-neutral-500 truncate">
                                        {domain}
                                      </div>
                                    )}
                                  </div>
                                </Link>

                                <div className="flex items-center gap-2 shrink-0">
                                  {res.isFavourite && (
                                    <span className="text-[10px] text-[#D97757]" title="Favorite">
                                      ★
                                    </span>
                                  )}
                                  <span className="text-[10px] text-neutral-500 font-mono hidden sm:inline">
                                    {formatRelativeTime(res.createdAt)}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="pt-2 flex justify-end">
                          <Link
                            to={`/categories/${category._id}`}
                            className="text-xs text-[#D97757] hover:underline flex items-center gap-1 font-medium"
                          >
                            <span>View all {category.resourceCount || preview.resources.length} resources</span>
                            <Flaticon name="angle-small-right" className="text-xs" />
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
        <div className="py-14 text-center rounded-md border border-[#3E3E38] p-8 bg-[#1C1C1B] space-y-3">
          <h3 className="text-sm font-medium text-[#FAF9F5]">
            {isCollectionsRoute ? 'No collections yet' : 'No categories yet'}
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            {isCollectionsRoute
              ? 'Create curated sets or playlists of resources around a specific topic or theme.'
              : 'Classify your developer tools, snippets, and references by domain or discipline.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-2">
            <Button
              size="xs"
              leftIcon={<Flaticon name="plus" className="text-xs" />}
              onClick={() => openCreateModal(isCollectionsRoute ? 'custom' : 'premade')}
            >
              {isCollectionsRoute ? 'New Collection' : 'New Category'}
            </Button>
          </div>
        </div>
      )}

      {/* Simplified Creation Modal: Pre-made (1-click) or Custom */}
      <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialTab={createModalTab}
        type={currentType}
        onSuccess={() => {
          fetchCategories();
        }}
      />

      {/* Edit Category/Collection Name & Color Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={isCollectionsRoute ? 'Edit Collection' : 'Edit Category'}
        description={
          isCollectionsRoute
            ? 'Update collection name and color accent.'
            : 'Update category name and color accent.'
        }
        maxWidth="sm"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 font-sans pt-1">
          {editError && (
            <div className="p-2.5 rounded-md bg-rose-950/20 border border-rose-900/40 text-xs text-rose-400">
              {editError}
            </div>
          )}

          <div>
            <Input
              label="Category Name"
              placeholder="e.g. Tools, Frontend, Libraries"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
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
                  onClick={() => setEditColor(c)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-transform cursor-pointer',
                    editColor === c && 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1B]'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#3E3E38] flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingEdit}
            >
              Save Changes
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
