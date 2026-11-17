import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { Resource, Project, Collection, ResourceType } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
import { EditResourceModal } from '../components/resources/EditResourceModal';
import { DeleteConfirmModal } from '../components/ui/DeleteConfirmModal';
import { Button } from '../components/ui/Button';
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
  Link2,
} from 'lucide-react';

const categoryPills: Array<{ type: ResourceType; label: string; icon: React.ReactNode }> = [
  { type: 'development', label: 'Development', icon: <Code2 className="w-4 h-4" /> },
  { type: 'ui', label: 'UI & Components', icon: <Layout className="w-4 h-4" /> },
  { type: 'design', label: 'Design & Colors', icon: <Palette className="w-4 h-4" /> },
  { type: 'data', label: 'Data & APIs', icon: <Database className="w-4 h-4" /> },
  { type: 'learning', label: 'Documentation', icon: <BookOpen className="w-4 h-4" /> },
  { type: 'personal', label: 'Personal Notes', icon: <FileText className="w-4 h-4" /> },
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

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    window.dispatchEvent(new CustomEvent('open-quick-add', { detail: { url: quickUrl.trim() } }));
    setQuickUrl('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDED]">
            {getTimeGreeting()}, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Overview of your saved developer resources and activity.
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

      {/* 2. Quick Capture Bar */}
      <form
        onSubmit={handleQuickCapture}
        className="flex items-center gap-2 p-1.5 rounded-md bg-[#121316] border border-white/[0.08] focus-within:border-white/20 transition-colors"
      >
        <div className="pl-2.5 text-neutral-500 shrink-0">
          <Link2 className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={quickUrl}
          onChange={(e) => setQuickUrl(e.target.value)}
          placeholder="Paste a link to quickly save it to your library..."
          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-[#E5E5E5] placeholder:text-neutral-500 px-2 py-1"
        />
        <Button
          type="submit"
          variant="secondary"
          size="xs"
          className="shrink-0 h-7 text-xs font-medium"
        >
          Save Link
        </Button>
      </form>

      {/* 3. Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link
          to="/library"
          className="p-4 rounded-md bg-[#121316] border border-white/[0.08] hover:border-white/20 transition-colors group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium text-neutral-400">Total Resources</span>
            <Layers className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
            {totalCount}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Saved across all categories
          </span>
        </Link>

        <Link
          to="/favourites"
          className="p-4 rounded-md bg-[#121316] border border-white/[0.08] hover:border-white/20 transition-colors group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium text-neutral-400">Favorites</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/80" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
            {favouriteResources.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Starred for quick access
          </span>
        </Link>

        <Link
          to="/collections"
          className="p-4 rounded-md bg-[#121316] border border-white/[0.08] hover:border-white/20 transition-colors group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium text-neutral-400">Collections</span>
            <BookmarkCheck className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
            {collections.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Curated stacks
          </span>
        </Link>

        <Link
          to="/projects"
          className="p-4 rounded-md bg-[#121316] border border-white/[0.08] hover:border-white/20 transition-colors group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium text-neutral-400">Projects</span>
            <FolderKanban className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-[#EDEDED]">
            {projects.length}
          </div>
          <span className="text-[11px] text-neutral-500 mt-0.5 block">
            Active workspaces
          </span>
        </Link>
      </div>

      {/* 4. Categories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Categories
          </h2>
          <Link
            to="/library"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categoryPills.map((cat) => (
            <Link
              key={cat.type}
              to={`/library?type=${cat.type}`}
              className="p-3 rounded-md bg-[#121316] border border-white/[0.08] hover:border-white/20 transition-colors group"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="text-neutral-400 group-hover:text-white transition-colors">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {categoryCounts[cat.type] || 0}
                </span>
              </div>
              <div className="font-medium text-xs text-[#EDEDED] group-hover:text-white truncate transition-colors">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 5. Recently Added */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-medium text-[#EDEDED]">
              Recently Added
            </h2>
          </div>
          <Link
            to="/recently-added"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 rounded-md bg-[#121316] border border-white/[0.08] text-center text-xs text-neutral-400">
            Loading resources...
          </div>
        ) : recentResources.length === 0 ? (
          <div className="p-8 rounded-md bg-[#121316] border border-white/[0.08] text-center space-y-3">
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Your library is currently empty. Start by saving a link or creating a resource.
            </p>
            <Button
              onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
              size="xs"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Resource
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* 6. Collections Overview */}
      {collections.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-neutral-400" />
              <h2 className="text-sm font-medium text-[#EDEDED]">
                Collections
              </h2>
            </div>
            <Link
              to="/collections"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Manage collections</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {collections.slice(0, 4).map((col) => (
              <Link
                key={col._id}
                to={`/collections/${col._id}`}
                className="p-4 rounded-md bg-[#121316] border border-white/[0.08] hover:border-white/20 transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: col.color || '#09AE5B' }}
                    />
                    <span className="text-[11px] text-neutral-500 font-mono">
                      {col.resourceCount || 0} {col.resourceCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <h3 className="font-medium text-xs text-[#EDEDED] group-hover:text-white truncate transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                    {col.description || 'No description.'}
                  </p>
                </div>
                <div className="text-[11px] text-neutral-500 pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span>Open collection</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
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

export default DashboardPage;