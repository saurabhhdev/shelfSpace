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
  { id: 'design', label: 'Design & Colors', type: 'design', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'data', label: 'Data & APIs', type: 'data', icon: <Database className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Learning & Docs', type: 'learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'personal', label: 'Personal Snippets', type: 'personal', icon: <FileText className="w-3.5 h-3.5" /> },
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
            <span>Library</span>
            <span>•</span>
            <span>{totalCount} items</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5] mt-0.5">
            Resource Library
          </h1>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] mt-1">
            Search, filter, and organize all tools, links, color palettes, and code snippets.
          </p>
        </div>

        {/* View mode toggle & Sort */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] text-xs text-[#5f5e5b] dark:text-[#a1a1aa]">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8e8d8a]" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setPage(1);
              }}
              className="bg-transparent focus:outline-none cursor-pointer text-xs"
            >
              <option value="recent">Recently Added</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title A–Z</option>
              <option value="title_desc">Title Z–A</option>
            </select>
          </div>

          {/* View mode buttons */}
          <div className="flex rounded-lg border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors cursor-pointer',
                viewMode === 'grid'
                  ? 'bg-[#f0f0ee] dark:bg-[#25252d] text-[#191919] dark:text-white'
                  : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors cursor-pointer',
                viewMode === 'list'
                  ? 'bg-[#f0f0ee] dark:bg-[#25252d] text-[#191919] dark:text-white'
                  : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
              )}
              title="List view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Notion-style Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#ececeb] dark:border-[#222227]">
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
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#191919] dark:bg-white text-white dark:text-zinc-950 shadow-2xs font-semibold'
                  : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#1c1c22]'
              )}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-[#8e8d8a] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Filter resources in this view..."
          className="w-full h-9 pl-9 pr-4 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] text-[#2b2a28] dark:text-[#f4f4f5] placeholder:text-[#9b9a97] dark:placeholder:text-[#63636e] focus:outline-none focus:ring-2 focus:ring-zinc-950/10 dark:focus:ring-white/15 focus:border-zinc-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Resource Cards */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'space-y-2')}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-[#f7f7f5] dark:bg-[#18181c] animate-pulse border border-[#ececeb] dark:border-[#26262c]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'
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
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#ececeb] dark:border-[#26262c] p-8 bg-white dark:bg-[#18181c]">
          <div className="w-10 h-10 rounded-xl bg-[#f7f7f5] dark:bg-[#202026] text-[#8e8d8a] flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#2b2a28] dark:text-[#f4f4f5] mb-1">
            No resources found
          </h3>
          <p className="text-xs text-[#787774] dark:text-[#a1a1aa] max-w-sm mx-auto mb-4">
            {search
              ? `No resources match the query "${search}". Try clearing search filter or switching categories.`
              : 'Your workspace library is currently empty. Start by saving a link or creating your first resource.'}
          </p>
          {search ? (
            <Button variant="outline" size="xs" onClick={() => setSearch('')}>
              Clear Search Filter
            </Button>
          ) : (
            <Button
              variant="primary"
              size="xs"
              pill
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
            >
              Add First Resource
            </Button>
          )}
        </div>
      )}

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-[#ececeb] dark:border-[#222227] text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
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
      {editingResource && (
        <EditResourceModal
          isOpen={editingResource !== null}
          resource={editingResource}
          projects={projects}
          collections={collections}
          onClose={() => setEditingResource(null)}
          onSuccess={() => fetchResources()}
        />
      )}

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
