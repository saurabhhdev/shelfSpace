import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  ArrowUpDown,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource, ResourceType, Collection } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ResourceModal } from '../components/resources/ResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { Button } from '../components/ui/Button';
import { RESOURCE_TYPES } from '../lib/resourceTypes';
import { useNotification } from '../context/NotificationContext';
import { cn } from '../lib/utils';

export const LibraryPage: React.FC = () => {
  const { notify } = useNotification();

  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State (with persistence)
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('shelfspace_view_mode') as 'grid' | 'list') || 'list';
  });

  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title_asc'>(() => {
    return (localStorage.getItem('shelfspace_sort') as 'recent' | 'oldest' | 'title_asc') || 'recent';
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResource, setDeletingResource] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Remember view mode preference
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('shelfspace_view_mode', mode);
  };

  // Remember sort preference
  const handleSortChange = (newSort: 'recent' | 'oldest' | 'title_asc') => {
    setSortBy(newSort);
    localStorage.setItem('shelfspace_sort', newSort);
    setPage(1);
  };

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        sortBy,
        page,
        limit: 15,
        status: 'active',
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (categoryFilter !== 'all') {
        params.collectionId = categoryFilter;
      }
      if (onlyFavorites) {
        params.isFavourite = true;
      }
      if (search.trim()) {
        params.search = search.trim();
      }

      const res = await apiClient.get('/resources', { params });
      if (res.data?.success) {
        setResources(res.data.data);
        if (res.data.meta) {
          setTotalCount(res.data.meta.total || 0);
          setTotalPages(res.data.meta.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, categoryFilter, onlyFavorites, search, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success) setCategories(res.data.data);
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleToggleFavourite = async (id: string) => {
    try {
      const res = await apiClient.patch(`/resources/${id}/favourite`);
      const isFav = res.data?.data?.isFavourite;
      notify(isFav ? 'Added to favorites' : 'Removed from favorites', 'success');
      fetchResources();
    } catch {
      notify('Failed to update favorite', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${deletingResource.id}`);
      notify(`"${deletingResource.name}" moved to trash`, 'success');
      setDeletingResource(null);
      fetchResources();
    } catch (err) {
      notify('Failed to delete resource', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setOnlyFavorites(false);
    setPage(1);
  };

  const hasActiveFilters = search || typeFilter !== 'all' || categoryFilter !== 'all' || onlyFavorites;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#EDEDED]">
            All Resources
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Browse, filter, and manage your saved resources ({totalCount} total).
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          size="sm"
          className="self-start sm:self-auto shrink-0"
        >
          Add Resource
        </Button>
      </div>

      {/* Search and Compact Filter Controls */}
      <div className="space-y-3">
        {/* Search Bar + Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, description, url, or tag..."
              className="w-full h-9 pl-9 pr-14 rounded-md text-xs sm:text-sm bg-[#121316] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Sorting */}
            <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-white/[0.08] bg-[#121316] text-xs text-neutral-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer text-xs text-[#E5E5E5]"
              >
                <option value="recent" className="bg-[#121316]">Recently Added</option>
                <option value="oldest" className="bg-[#121316]">Oldest First</option>
                <option value="title_asc" className="bg-[#121316]">Alphabetical (A–Z)</option>
              </select>
            </div>

            {/* List / Grid view switcher */}
            <div className="flex rounded-md border border-white/[0.08] bg-[#121316] p-0.5">
              <button
                onClick={() => handleViewModeChange('list')}
                className={cn(
                  'p-1.5 rounded-sm transition-colors cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-neutral-400 hover:text-white'
                )}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={cn(
                  'p-1.5 rounded-sm transition-colors cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-neutral-400 hover:text-white'
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Filters Row: Type Filter, Category Filter, Favorites toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Resource Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-8 px-2.5 rounded-md border border-white/[0.08] bg-[#121316] text-neutral-300 text-xs focus:outline-none focus:border-white/20"
          >
            <option value="all">All Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 px-2.5 rounded-md border border-white/[0.08] bg-[#121316] text-neutral-300 text-xs focus:outline-none focus:border-white/20"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Favorites Filter */}
          <button
            type="button"
            onClick={() => {
              setOnlyFavorites(!onlyFavorites);
              setPage(1);
            }}
            className={cn(
              'h-8 px-2.5 rounded-md border text-xs flex items-center gap-1.5 transition-colors cursor-pointer',
              onlyFavorites
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300'
                : 'bg-[#121316] border-white/[0.08] text-neutral-400 hover:text-white'
            )}
          >
            <Star className={cn('w-3 h-3', onlyFavorites && 'fill-amber-400')} />
            <span>Favorites only</span>
          </button>

          {/* Clear Filters Button if any active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="h-8 px-2 text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Resource Collection */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2')}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-md bg-[#121316] animate-pulse border border-white/[0.06]"
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
              onDelete={(id, name) => setDeletingResource({ id, name })}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : hasActiveFilters ? (
        <div className="py-14 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316] space-y-3">
          <h3 className="text-sm font-medium text-[#EDEDED]">
            No resources found
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No items matched your active search or filter criteria.
          </p>
          <Button variant="secondary" size="xs" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="py-14 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316] space-y-3">
          <h3 className="text-sm font-medium text-[#EDEDED]">
            Your library is empty
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Start saving your essential developer tools, components, repositories, and notes.
          </p>
          <Button size="xs" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => setIsAddOpen(true)}>
            Add Resource
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
          <div>
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      <ResourceModal
        isOpen={isAddOpen}
        categories={categories}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchResources()}
        onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
      />

      {/* Edit Resource Modal */}
      {editingResource && (
        <ResourceModal
          isOpen={true}
          resource={editingResource}
          categories={categories}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchResources();
          }}
          onCategoryCreated={(newCat) => setCategories((prev) => [...prev, newCat])}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingResource}
        title="Delete Resource?"
        message={`Are you sure you want to delete "${deletingResource?.name}"? You can restore it from trash within 30 days.`}
        confirmText="Delete"
        onCancel={() => setDeletingResource(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default LibraryPage;
