import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { Resource, Project, Collection, ResourceType } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { Button } from '../components/ui/Button';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import {
  Plus,
  ArrowRight,
  Star,
  Clock,
  FolderKanban,
  BookmarkCheck,
  Layers,
  Code2,
  Layout,
  Palette,
  Database,
  BookOpen,
  FileText,
  Sparkles,
  Link2,
} from 'lucide-react';

const categoryPills: Array<{ type: ResourceType; label: string; icon: React.ReactNode }> = [
  { type: 'development', label: 'Development', icon: <Code2 className="w-3.5 h-3.5" /> },
  { type: 'ui', label: 'UI / Components', icon: <Layout className="w-3.5 h-3.5" /> },
  { type: 'design', label: 'Design & Palettes', icon: <Palette className="w-3.5 h-3.5" /> },
  { type: 'data', label: 'Data & APIs', icon: <Database className="w-3.5 h-3.5" /> },
  { type: 'learning', label: 'Learning & Docs', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { type: 'personal', label: 'Personal Snippets', icon: <FileText className="w-3.5 h-3.5" /> },
];

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [favouriteResources, setFavouriteResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quickUrl, setQuickUrl] = useState<string>('');

  // Modals
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [recentRes, favRes, projRes, colRes] = await Promise.all([
        apiClient.get('/resources', { params: { limit: 6, sortBy: 'recent', status: 'active' } }),
        apiClient.get('/resources', { params: { limit: 4, isFavourite: true, status: 'active' } }),
        apiClient.get('/projects'),
        apiClient.get('/collections'),
      ]);

      if (recentRes.data?.success) {
        setRecentResources(recentRes.data.data);
        if (recentRes.data.meta?.total !== undefined) {
          setTotalCount(recentRes.data.meta.total);
        }
      }

      if (favRes.data?.success) {
        setFavouriteResources(favRes.data.data);
      }

      if (projRes.data?.success) {
        setProjects(projRes.data.data);
      }

      if (colRes.data?.success) {
        setCollections(colRes.data.data);
      }

      // Fetch counts per category
      const counts: Record<string, number> = {};
      await Promise.all(
        categoryPills.map(async (cat) => {
          try {
            const r = await apiClient.get('/resources', { params: { type: cat.type, limit: 1 } });
            counts[cat.type] = r.data?.meta?.total || 0;
          } catch {
            counts[cat.type] = 0;
          }
        })
      );
      setCategoryCounts(counts);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleAdded = () => fetchDashboardData();
    window.addEventListener('resource-added', handleAdded);
    return () => window.removeEventListener('resource-added', handleAdded);
  }, []);

  const handleToggleFavourite = async (id: string) => {
    try {
      await apiClient.patch(`/resources/${id}/favourite`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await apiClient.delete(`/resources/${deletingId}`);
      setDeletingId(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    // Dispatch quick add trigger event with URL
    window.dispatchEvent(new CustomEvent('open-quick-add', { detail: { url: quickUrl.trim() } }));
    setQuickUrl('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. NOTION-STYLE WORKSPACE HEADER */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a] font-mono">
          <span>{formattedDate}</span>
          <span>•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
              Workspace Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#787774] dark:text-[#a1a1aa] mt-0.5">
              Everything useful, never lost. Capture, categorize, and recall tools and ideas.
            </p>
          </div>

          {/* Quick-Action Button */}
          <Button
            variant="primary"
            pill
            size="sm"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-quick-add'));
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="self-start sm:self-auto shadow-xs text-xs h-8.5 px-4"
          >
            Add New Resource
          </Button>
        </div>
      </div>

      {/* 2. LINKNEST-STYLE QUICK CAPTURE BAR */}
      <form
        onSubmit={handleQuickCapture}
        className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] shadow-2xs hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-colors"
      >
        <div className="pl-2.5 text-[#8e8d8a] dark:text-[#71717a] shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={quickUrl}
          onChange={(e) => setQuickUrl(e.target.value)}
          placeholder="Paste any link to auto-extract metadata and save to Shelfspace..."
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5] placeholder:text-[#9b9a97] dark:placeholder:text-[#63636e] px-2 py-1"
        />
        <Button
          type="submit"
          variant="secondary"
          size="xs"
          pill
          className="shrink-0 text-xs h-7 px-3"
        >
          Capture Link
        </Button>
      </form>

      {/* 3. WORKSPACE STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/library"
          className="p-4 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#8e8d8a] dark:text-[#71717a] mb-2">
            <span className="text-xs font-medium">All Resources</span>
            <Layers className="w-4 h-4 group-hover:text-[#2b2a28] dark:group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            {totalCount}
          </div>
          <span className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] mt-0.5 block">
            Saved across library
          </span>
        </Link>

        <Link
          to="/favourites"
          className="p-4 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#8e8d8a] dark:text-[#71717a] mb-2">
            <span className="text-xs font-medium">Favorites</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500/20 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            {favouriteResources.length}
          </div>
          <span className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] mt-0.5 block">
            Starred items
          </span>
        </Link>

        <Link
          to="/collections"
          className="p-4 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#8e8d8a] dark:text-[#71717a] mb-2">
            <span className="text-xs font-medium">Collections</span>
            <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            {collections.length}
          </div>
          <span className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] mt-0.5 block">
            Organized stacks
          </span>
        </Link>

        <Link
          to="/projects"
          className="p-4 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all group shadow-2xs"
        >
          <div className="flex items-center justify-between text-[#8e8d8a] dark:text-[#71717a] mb-2">
            <span className="text-xs font-medium">Projects</span>
            <FolderKanban className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            {projects.length}
          </div>
          <span className="text-[11px] text-[#8e8d8a] dark:text-[#71717a] mt-0.5 block">
            Active workspaces
          </span>
        </Link>
      </div>

      {/* 4. CATEGORY SHORTCUTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9b9a97] dark:text-[#71717a]">
            Resource Categories
          </h2>
          <Link
            to="/library"
            className="text-xs text-[#5f5e5b] dark:text-[#a1a1aa] hover:text-[#2b2a28] dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categoryPills.map((cat) => (
            <Link
              key={cat.type}
              to={`/library?type=${cat.type}`}
              className="p-3 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all group shadow-2xs"
            >
              <div className="flex items-center justify-between text-[#8e8d8a] dark:text-[#71717a] mb-2">
                <span className="p-1 rounded-md bg-[#f7f7f5] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5]">
                  {cat.icon}
                </span>
                <span className="text-[10px] font-mono font-medium">
                  {categoryCounts[cat.type] || 0}
                </span>
              </div>
              <div className="font-medium text-xs text-[#2b2a28] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white truncate">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. RECENTLY ADDED RESOURCES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8e8d8a] dark:text-[#71717a]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9b9a97] dark:text-[#71717a]">
              Recently Added
            </h2>
          </div>
          <Link
            to="/recently-added"
            className="text-xs text-[#5f5e5b] dark:text-[#a1a1aa] hover:text-[#2b2a28] dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-10 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] text-center text-xs text-[#8e8d8a] dark:text-[#71717a]">
            Loading recent resources...
          </div>
        ) : recentResources.length === 0 ? (
          <div className="p-8 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] text-center space-y-2">
            <p className="text-xs text-[#787774] dark:text-[#a1a1aa]">Your library is empty.</p>
            <Button
              size="xs"
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
            >
              Add your first resource
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {recentResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                viewMode="grid"
                onToggleFavourite={handleToggleFavourite}
                onDelete={(id) => setDeletingId(id)}
                onEdit={(res) => setEditingResource(res)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. RECENT COLLECTIONS PREVIEW */}
      {collections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9b9a97] dark:text-[#71717a]">
                Collections Overview
              </h2>
            </div>
            <Link
              to="/collections"
              className="text-xs text-[#5f5e5b] dark:text-[#a1a1aa] hover:text-[#2b2a28] dark:hover:text-white flex items-center gap-1 font-medium transition-colors"
            >
              <span>Manage Collections</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {collections.slice(0, 4).map((col) => (
              <Link
                key={col._id}
                to={`/collections/${col._id}`}
                className="p-4 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-all group shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color || '#10b981' }}
                    />
                    <span className="text-[10px] font-mono text-[#8e8d8a] dark:text-[#71717a] px-1.5 py-0.5 rounded bg-[#f7f7f5] dark:bg-[#202026]">
                      {col.resourceCount || 0} items
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5] group-hover:text-black dark:group-hover:text-white truncate">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-[#787774] dark:text-[#a1a1aa] line-clamp-2 mt-1">
                    {col.description || 'No description provided.'}
                  </p>
                </div>
                <div className="text-[10px] text-[#8e8d8a] dark:text-[#71717a] font-mono pt-3 mt-3 border-t border-[#f1f1ef] dark:border-[#222227]">
                  Open collection →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <EditResourceModal
          resource={editingResource}
          isOpen={true}
          projects={projects}
          collections={collections}
          onClose={() => setEditingResource(null)}
          onSuccess={() => {
            setEditingResource(null);
            fetchDashboardData();
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
        onConfirm={handleDelete}
      />
    </div>
  );
};
