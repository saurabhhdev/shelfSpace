import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  ArrowUpDown,
  Palette,
  Layout,
  Code2,
  Database,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource, ResourceType, Project, Collection } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const categories: Array<{ id: string; label: string; type?: ResourceType; icon: React.ReactNode }> = [
  { id: 'all', label: 'All Resources', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'development', label: 'Development', type: 'development', icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: 'ui', label: 'UI / Components', type: 'ui', icon: <Layout className="w-3.5 h-3.5" /> },
  { id: 'design', label: 'Design', type: 'design', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'data', label: 'Data & APIs', type: 'data', icon: <Database className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Learning', type: 'learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'personal', label: 'Personal', type: 'personal', icon: <FileText className="w-3.5 h-3.5" /> },
];

export const LibraryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';

  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>(initialType);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title_asc' | 'title_desc'>('recent');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    try {
      const selectedCat = categories.find((c) => c.id === activeCategory);
      const res = await apiClient.get('/resources', {
        params: {
          type: selectedCat?.type,
          search: search.trim() || undefined,
          sortBy,
          page,
          limit: 18,
          status: 'active',
        },
      });

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
  }, [activeCategory, search, sortBy, page]);

  const fetchWorkspaceAuxData = async () => {
    try {
      const [projRes, colRes] = await Promise.all([
        apiClient.get('/projects'),
        apiClient.get('/collections'),
      ]);
      if (projRes.data?.success) setProjects(projRes.data.data);
      if (colRes.data?.success) setCollections(colRes.data.data);
    } catch (e) {
      console.error('Failed to fetch aux data', e);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    fetchWorkspaceAuxData();
  }, []);

  useEffect(() => {
    const handleResourceAdded = () => {
      fetchResources();
    };
    window.addEventListener('resource-added', handleResourceAdded);
    return () => window.removeEventListener('resource-added', handleResourceAdded);
  }, [fetchResources]);

  const handleToggleFavourite = async (id: string) => {
    try {
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, isFavourite: !r.isFavourite } : r))
      );
      await apiClient.patch(`/resources/${id}/favourite`);
    } catch (err) {
      fetchResources();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/resources/${deletingId}`);
      setDeletingId(null);
      fetchResources();
    } catch (err) {
      console.error('Failed to trash resource', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
            CENTRAL LIBRARY
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec] mt-0.5">
            Resource Library
          </h1>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] mt-1">
            {totalCount} saved {totalCount === 1 ? 'resource' : 'resources'} in your personal library
          </p>
        </div>

        {/* View mode toggle & Sort */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] text-xs text-[#57524b] dark:text-[#aba499]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8a8277]" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title A–Z</option>
              <option value="title_desc">Title Z–A</option>
            </select>
          </div>

          {/* View mode buttons */}
          <div className="flex rounded-lg border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]'
                  : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-colors cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]'
                  : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#ded8cb] dark:border-[#2f2c27]">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setPage(1);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all border-b-2 -mb-[1px] cursor-pointer',
                isActive
                  ? 'border-[#1e3a2f] dark:border-[#86efac] text-[#1e3a2f] dark:text-[#86efac] bg-[#edf4f0] dark:bg-[#1a2b22]/50'
                  : 'border-transparent text-[#57524b] dark:text-[#aba499] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#f5f2eb]/60 dark:hover:bg-[#201e1b]/40'
              )}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8a8277] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Filter resources in this category..."
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] text-[#191715] dark:text-[#f5f2ec] placeholder:text-[#8a8277] focus:outline-none focus:ring-2 focus:ring-[#1e3a2f]/20 focus:border-[#1e3a2f]"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Resource Cards */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2')}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-[#f5f2eb] dark:bg-[#201e1b] animate-pulse border border-[#ded8cb] dark:border-[#2f2c27]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-2'
          )}
        >
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              viewMode={viewMode}
              onToggleFavourite={handleToggleFavourite}
              onDelete={(id) => setDeletingId(id)}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ded8cb] dark:border-[#2f2c27] p-8">
          <div className="w-10 h-10 rounded-xl bg-[#f5f2eb] dark:bg-[#201e1b] text-[#8a8277] flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#191715] dark:text-[#f5f2ec] mb-1">
            No resources found
          </h3>
          <p className="text-xs text-[#57524b] dark:text-[#aba499] max-w-sm mx-auto mb-5">
            {search
              ? `No items match the search query "${search}". Try searching another keyword or clearing the filter.`
              : 'Your workspace library is currently empty. Start by saving a link or creating your first resource.'}
          </p>
          {search ? (
            <Button variant="outline" size="sm" onClick={() => setSearch('')}>
              Clear Search Filter
            </Button>
          ) : (
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                const addBtn = document.querySelector('header button:has(svg)') as HTMLButtonElement;
                if (addBtn) addBtn.click();
              }}
            >
              Add First Resource
            </Button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#ded8cb] dark:border-[#2f2c27] text-xs text-[#8a8277] font-mono">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
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

      {/* Edit Modal */}
      <EditResourceModal
        isOpen={editingResource !== null}
        resource={editingResource}
        projects={projects}
        collections={collections}
        onClose={() => setEditingResource(null)}
        onSuccess={() => fetchResources()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};
