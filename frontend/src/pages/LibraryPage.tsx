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
  const [_isDeleting, setIsDeleting] = useState(false);

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
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Page Header Frame */}
      <div className="relative rounded-none border border-white/[0.08] bg-[#121316] p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-none bg-neutral-800/60 px-2 py-0.5 text-xs text-neutral-300 font-mono mb-2">
              <span className="w-1.5 h-1.5 rounded-none bg-[#09AE5B]"></span>
              <span>Library Index</span>
              <span className="text-neutral-500">•</span>
              <span>{totalCount} items saved</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E5E5E5]">
              Resource Catalog
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Search, filter, and reference all technical tools, links, color palettes, and code snippets.
            </p>
          </div>

          {/* View mode toggle & Sort */}
          <div className="flex items-center gap-2.5">
            {/* Sort dropdown */}
            <div className="flex items-center gap-1.5 h-8.5 px-3 rounded-none border border-white/[0.08] bg-[#0E0F10] text-xs text-neutral-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#09AE5B]" />
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setPage(1);
                }}
                className="bg-transparent focus:outline-none cursor-pointer text-xs text-[#E5E5E5]"
              >
                <option value="recent" className="bg-[#121316]">Recently Added</option>
                <option value="oldest" className="bg-[#121316]">Oldest First</option>
                <option value="title_asc" className="bg-[#121316]">Title A–Z</option>
                <option value="title_desc" className="bg-[#121316]">Title Z–A</option>
              </select>
            </div>

            {/* View mode buttons */}
            <div className="flex rounded-none border border-white/[0.08] bg-[#0E0F10] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-none transition-colors cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-[#E5E5E5] text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                )}
                title="Grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-none transition-colors cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-[#E5E5E5] text-black font-semibold'
                    : 'text-neutral-400 hover:text-white'
                )}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills (Sharp) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-none whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#E5E5E5] text-black font-semibold shadow-sm'
                  : 'text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
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
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Filter resources in this view by name, tag, or domain..."
          className="w-full h-10 pl-10 pr-16 rounded-none text-xs sm:text-sm bg-[#121316] border border-white/[0.08] text-[#E5E5E5] placeholder:text-neutral-500 focus:outline-none focus:border-[#09AE5B]/70 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* 4. Resource Cards */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5' : 'space-y-2.5')}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-none bg-[#121316] animate-pulse border border-white/[0.06]"
            />
          ))}
        </div>
      ) : resources.length > 0 ? (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5'
              : 'space-y-2.5'
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
        <div className="py-16 text-center rounded-none border border-white/[0.08] p-8 bg-[#121316]">
          <div className="w-10 h-10 rounded-none bg-white/[0.05] text-[#09AE5B] flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#E5E5E5] mb-1">
            No resources found
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            {search
              ? `No resources match the query "${search}". Try clearing your search or switching categories.`
              : 'Your workspace library is currently empty. Start by saving a link or creating your first resource.'}
          </p>
          {search ? (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-1.5 rounded-none bg-[#242424] text-xs font-medium text-white hover:bg-[#2e2e2e] transition-colors"
            >
              Clear Search Filter
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-[#09AE5B] text-xs font-semibold text-black hover:bg-[#07914b] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Resource</span>
            </button>
          )}
        </div>
      )}

      {/* 5. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
          <div>
            Page {page} of {totalPages} ({totalCount} total)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-[#121316] border border-white/[0.08] text-xs disabled:opacity-40 hover:bg-white/[0.06]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-none bg-[#121316] border border-white/[0.08] text-xs disabled:opacity-40 hover:bg-white/[0.06]"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          isOpen={true}
          projects={projects}
          collections={collections}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchResources();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        title="Move Resource to Trash?"
        message="This resource will be moved to Trash. You can restore it anytime within 30 days."
        confirmText="Move to Trash"
        onCancel={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default LibraryPage;
