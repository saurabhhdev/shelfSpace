import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Resource, Project, Collection, ResourceType } from '../types';
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

  // Modals
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [recentRes, favRes, projRes, colRes] = await Promise.all([
        apiClient.get('/resources', { params: { limit: 4, sortBy: 'recent', status: 'active' } }),
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

      // Fetch counts per category dynamically
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

  const triggerQuickAdd = () => {
    const btn = document.querySelector('header button[aria-label="Add Resource"]') || document.querySelector('header button:has(svg)');
    if (btn) (btn as HTMLButtonElement).click();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. PERSONALIZED WELCOME HERO */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#edf4f0] dark:bg-[#1a2b22] border border-[#cadfd5] dark:border-[#2d4d3c] text-[10px] font-mono uppercase tracking-wider text-[#1e3a2f] dark:text-[#86efac]">
            <span>{getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Developer'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec]">
            Your Developer Workbench
          </h1>

          <p className="text-xs sm:text-sm text-[#57524b] dark:text-[#aba499] max-w-xl leading-relaxed">
            Everything useful, never lost. Collect, cross-reference, and reuse the resources behind everything you build.
          </p>
        </div>

        {/* Quick Stats Overview */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] text-xs">
            <div>
              <span className="text-[#8a8277] block text-[10px] font-mono uppercase">Total Items</span>
              <span className="font-bold text-base text-[#191715] dark:text-[#f5f2ec]">{totalCount}</span>
            </div>
            <div className="w-px h-6 bg-[#ded8cb] dark:bg-[#2f2c27]" />
            <div>
              <span className="text-[#8a8277] block text-[10px] font-mono uppercase">Projects</span>
              <span className="font-bold text-base text-[#191715] dark:text-[#f5f2ec]">{projects.length}</span>
            </div>
            <div className="w-px h-6 bg-[#ded8cb] dark:bg-[#2f2c27]" />
            <div>
              <span className="text-[#8a8277] block text-[10px] font-mono uppercase">Collections</span>
              <span className="font-bold text-base text-[#191715] dark:text-[#f5f2ec]">{collections.length}</span>
            </div>
          </div>

          <Button onClick={triggerQuickAdd} leftIcon={<Plus className="w-4 h-4" />}>
            Add Resource
          </Button>
        </div>
      </div>

      {/* 2. CATEGORY SHORTCUTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8277]">
            Browse by Discipline
          </h2>
          <Link to="/library" className="text-xs text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium">
            Open Library →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categoryPills.map((cat) => (
            <Link
              key={cat.type}
              to={`/library?type=${cat.type}`}
              className="p-3 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] hover:border-[#1e3a2f] dark:hover:border-[#387356] transition-all group"
            >
              <div className="flex items-center justify-between text-[#8a8277] mb-2">
                <span className="p-1 rounded-md bg-[#f5f2eb] dark:bg-[#22201d] text-[#191715] dark:text-[#f5f2ec]">
                  {cat.icon}
                </span>
                <span className="text-[11px] font-mono">
                  {categoryCounts[cat.type] || 0}
                </span>
              </div>
              <div className="font-medium text-xs text-[#191715] dark:text-[#f5f2ec] group-hover:text-[#1e3a2f] dark:group-hover:text-[#86efac] truncate">
                {cat.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. RECENTLY ADDED ROW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8a8277]" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8277]">
              Recently Added
            </h2>
          </div>
          <Link to="/recently-added" className="text-xs text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium">
            View All Recent →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-[#f5f2eb] dark:bg-[#201e1b] animate-pulse border border-[#ded8cb] dark:border-[#2f2c27]" />
            ))}
          </div>
        ) : recentResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentResources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                viewMode="grid"
                onToggleFavourite={handleToggleFavourite}
                onDelete={(id) => setDeletingId(id)}
                onEdit={(r) => setEditingResource(r)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border border-dashed border-[#ded8cb] dark:border-[#2f2c27] text-xs text-[#8a8277]">
            No resources saved yet. Press <kbd className="font-mono bg-[#f5f2eb] dark:bg-[#201e1b] px-1.5 py-0.5 rounded">N</kbd> or click Add Resource to start.
          </div>
        )}
      </div>

      {/* 4. SPLIT ROW: PROJECTS & COLLECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Overview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#1e3a2f] dark:text-[#86efac]" />
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">Active Projects</h3>
            </div>
            <Link to="/projects" className="text-xs text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium">
              Manage Projects →
            </Link>
          </div>

          <div className="space-y-2">
            {projects.length > 0 ? (
              projects.slice(0, 3).map((proj) => (
                <Link
                  key={proj._id}
                  to={`/projects/${proj._id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] hover:border-[#1e3a2f] dark:hover:border-[#387356] transition-colors"
                >
                  <div>
                    <h4 className="font-medium text-xs text-[#191715] dark:text-[#f5f2ec]">{proj.name}</h4>
                    {proj.description && (
                      <p className="text-[11px] text-[#8a8277] line-clamp-1 mt-0.5">{proj.description}</p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-[#8a8277] shrink-0">
                    {proj.resourceCount || 0} items
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-[#8a8277] py-4 text-center">No projects created yet.</p>
            )}
          </div>
        </div>

        {/* Collections Overview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">Thematic Collections</h3>
            </div>
            <Link to="/collections" className="text-xs text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium">
              Manage Collections →
            </Link>
          </div>

          <div className="space-y-2">
            {collections.length > 0 ? (
              collections.slice(0, 3).map((col) => (
                <Link
                  key={col._id}
                  to={`/collections/${col._id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] hover:border-[#1e3a2f] dark:hover:border-[#387356] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <div>
                      <h4 className="font-medium text-xs text-[#191715] dark:text-[#f5f2ec]">{col.name}</h4>
                      {col.description && (
                        <p className="text-[11px] text-[#8a8277] line-clamp-1 mt-0.5">{col.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#8a8277] shrink-0">
                    {col.resourceCount || 0} items
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-[#8a8277] py-4 text-center">No collections created yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. FAVOURITES QUICK ROW (If any) */}
      {favouriteResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#8a8277]">
                Pinned Favourites
              </h2>
            </div>
            <Link to="/favourites" className="text-xs text-[#1e3a2f] dark:text-[#86efac] hover:underline font-medium">
              All Favourites →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {favouriteResources.map((res) => (
              <ResourceCard
                key={res._id}
                resource={res}
                viewMode="grid"
                onToggleFavourite={handleToggleFavourite}
                onDelete={(id) => setDeletingId(id)}
                onEdit={(r) => setEditingResource(r)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      <EditResourceModal
        isOpen={editingResource !== null}
        resource={editingResource}
        projects={projects}
        collections={collections}
        onClose={() => setEditingResource(null)}
        onSuccess={() => fetchDashboardData()}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deletingId !== null}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
