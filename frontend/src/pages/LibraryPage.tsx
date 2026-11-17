import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List,
  Plus,
  ArrowUpDown,
  Code2,
  Layout,
  Palette,
  Database,
  BookOpen,
  FileText,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { apiClient } from '../api/client';
import type { Resource, ResourceType, Project, Collection } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const categories: Array<{ id: string; label: string; type?: ResourceType; icon: React.ReactNode }> = [
  { id: 'all', label: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'development', label: 'Development', type: 'development', icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: 'ui', label: 'UI & Components', type: 'ui', icon: <Layout className="w-3.5 h-3.5" /> },
  { id: 'design', label: 'Design & Colors', type: 'design', icon: <Palette className="w-3.5 h-3.5" /> },
  { id: 'data', label: 'Data & APIs', type: 'data', icon: <Database className="w-3.5 h-3.5" /> },
  { id: 'learning', label: 'Documentation', type: 'learning', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'personal', label: 'Personal Notes', type: 'personal', icon: <FileText className="w-3.5 h-3.5" /> },
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
    } catch {
      fetchResources();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/resources/${deletingId}`);
      setDeletingId(null);
      fetchResources();
    } catch (err) {
      console.error('Failed to trash resource', err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
            Resources
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Browse, search, and manage all your saved resources ({totalCount} total).
          </p>
        </div>

        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
          leftIcon={<Plus className="w-3.5 h-3.5 stroke-[2.5]" />}
          size="sm"
          className="self-start sm:self-auto"
        >
          Add Resource
        </Button>
      </div>

      {/* 2. Unified Search & Filter Bar */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer',
                  isActive
                    ? 'bg-white/[0.1] text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search, Sort, and View Controls */}
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
              placeholder="Search by title, description, domain, or tag..."
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
            {/* Sort selector */}
            <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-white/[0.08] bg-[#121316] text-xs text-neutral-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
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

            {/* View mode toggle */}
            <div className="flex rounded-md border border-white/[0.08] bg-[#121316] p-0.5">
              <button
                onClick={() => setViewMode('grid')}
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
              <button
                onClick={() => setViewMode('list')}
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
            </div>
          </div>
        </div>
      </div>

      {/* 3. Resource Cards List / Grid */}
      {isLoading ? (
        <div className={cn(viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2')}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-md bg-[#121316] animate-pulse border border-white/[0.06]"
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
              onDelete={(id) => setDeletingId(id)}
              onEdit={(r) => setEditingResource(r)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center rounded-md border border-white/[0.08] p-8 bg-[#121316]">
          <h3 className="text-sm font-medium text-[#EDEDED] mb-1">
            No resources found
          </h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
            {search
              ? `No resources match "${search}". Try checking for typos or selecting another category.`
              : 'Your library is currently empty. Start by saving a link or adding your first resource.'}
          </p>
          {search ? (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => setSearch('')}
            >
              Clear Search
            </Button>
          ) : (
            <Button
              size="xs"
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Resource
            </Button>
          )}
        </div>
      )}

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
          <div>
            Page {page} of {totalPages} ({totalCount} total)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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