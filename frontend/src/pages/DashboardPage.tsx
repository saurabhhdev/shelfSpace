import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { Resource, Project, Collection, ResourceType } from '../types';
import { ResourceCard } from '../components/resources/ResourceCard';
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
  Link2,
  Terminal,
  Compass,
  Sparkles,
  Command,
} from 'lucide-react';

const categoryPills: Array<{ type: ResourceType; label: string; icon: React.ReactNode; index: string }> = [
  { type: 'development', label: 'Development', icon: <Code2 className="w-3.5 h-3.5" />, index: '01' },
  { type: 'ui', label: 'UI / Components', icon: <Layout className="w-3.5 h-3.5" />, index: '02' },
  { type: 'design', label: 'Design & Palettes', icon: <Palette className="w-3.5 h-3.5" />, index: '03' },
  { type: 'data', label: 'Data & APIs', icon: <Database className="w-3.5 h-3.5" />, index: '04' },
  { type: 'learning', label: 'Learning & Docs', icon: <BookOpen className="w-3.5 h-3.5" />, index: '05' },
  { type: 'personal', label: 'Personal Snippets', icon: <FileText className="w-3.5 h-3.5" />, index: '06' },
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const handleQuickCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    window.dispatchEvent(new CustomEvent('open-quick-add', { detail: { url: quickUrl.trim() } }));
    setQuickUrl('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. WORKSPACE OVERVIEW FRAME */}
      <div className="relative rounded-none border border-white/[0.08] bg-[#121316] p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Architectural corner crosshair accents */}
        <span className="absolute top-2 left-2 text-white/20 font-mono text-[11px] select-none pointer-events-none">+</span>
        <span className="absolute top-2 right-2 text-white/20 font-mono text-[11px] select-none pointer-events-none">+</span>
        <span className="absolute bottom-2 left-2 text-white/20 font-mono text-[11px] select-none pointer-events-none">+</span>
        <span className="absolute bottom-2 right-2 text-white/20 font-mono text-[11px] select-none pointer-events-none">+</span>

        {/* Subtle dot matrix pattern overlay */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Subtle radial backdrop */}
        <div 
          className="pointer-events-none absolute top-0 right-0 w-96 h-96 opacity-15"
          style={{
            background: 'radial-gradient(circle at top right, rgba(9, 174, 91, 0.4), transparent 70%)'
          }}
        />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-none bg-neutral-800/60 border border-white/[0.04] px-2.5 py-0.5 text-xs text-neutral-300 font-mono mb-2.5">
                <span className="w-1.5 h-1.5 rounded-none bg-[#09AE5B]"></span>
                <span>{getTimeGreeting()}, {user?.name?.split(' ')[0] || 'Developer'}</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400">{formattedDate}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#E5E5E5] flex items-center gap-3">
                <span>Personal Workbench</span>
                <span className="hidden md:inline-flex items-center font-mono text-[10px] font-normal tracking-wider text-[#09AE5B] bg-[#09AE5B]/10 border border-[#09AE5B]/25 px-2 py-0.5">
                  WORKSPACE // 01
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-xl">
                Save, organize and reference your technical stack in one central library with zero cloud lock-in.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-quick-add'));
                }}
                className="self-start sm:self-auto inline-flex items-center gap-2 rounded-none bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold text-xs sm:text-sm px-4 py-2 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Resource</span>
              </button>
            </div>
          </div>

          {/* Quick-Capture Bar */}
          <form
            onSubmit={handleQuickCapture}
            className="flex items-center gap-2 p-1.5 sm:p-2 rounded-none bg-[#0E0F10] border border-white/[0.08] focus-within:border-[#09AE5B]/60 transition-colors shadow-inner"
          >
            <div className="pl-3 text-[#09AE5B] shrink-0 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-[10px] text-neutral-500 uppercase tracking-wider">URL //</span>
            </div>
            <input
              type="text"
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              placeholder="Paste any repository, doc, or component URL to auto-extract metadata..."
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-[#E5E5E5] placeholder:text-neutral-500 px-2 py-1 font-sans"
            />
            <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-neutral-500 pr-1 select-none">
              <span className="px-1.5 py-0.5 border border-white/10 bg-white/[0.04] text-neutral-400">⌘V</span>
              <span>+</span>
              <span className="px-1.5 py-0.5 border border-white/10 bg-white/[0.04] text-neutral-400">↵</span>
            </div>
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center rounded-none bg-[#E5E5E5] hover:bg-white text-black font-semibold text-xs px-4 py-1.5 transition-colors cursor-pointer"
            >
              Capture
            </button>
          </form>

          {/* Metrics Grid with Editorial Coordinates */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            <Link
              to="/library"
              className="p-4 rounded-none bg-[#141519] border border-white/[0.06] hover:border-[#09AE5B]/30 hover:bg-[#16181d] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neutral-500 group-hover:text-[#09AE5B] transition-colors">01</span>
                  <span className="text-xs font-mono uppercase tracking-wider">All Resources</span>
                </div>
                <div className="p-1 rounded-none bg-white/[0.03] group-hover:bg-[#09AE5B]/10 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-[#09AE5B]" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#E5E5E5] group-hover:text-white transition-colors">
                {totalCount}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400">
                <span>Active catalog</span>
                <span className="font-mono text-[9px] text-[#09AE5B]/70 tracking-widest uppercase">● SYNCED</span>
              </div>
            </Link>

            <Link
              to="/favourites"
              className="p-4 rounded-none bg-[#141519] border border-white/[0.06] hover:border-amber-400/30 hover:bg-[#16181d] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neutral-500 group-hover:text-amber-400 transition-colors">02</span>
                  <span className="text-xs font-mono uppercase tracking-wider">Favorites</span>
                </div>
                <div className="p-1 rounded-none bg-white/[0.03] group-hover:bg-amber-400/10 transition-colors">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/80" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#E5E5E5] group-hover:text-white transition-colors">
                {favouriteResources.length}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400">
                <span>Pinned links</span>
                <span className="font-mono text-[9px] text-amber-400/80 tracking-widest uppercase">★ STARRED</span>
              </div>
            </Link>

            <Link
              to="/collections"
              className="p-4 rounded-none bg-[#141519] border border-white/[0.06] hover:border-[#09AE5B]/30 hover:bg-[#16181d] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neutral-500 group-hover:text-[#09AE5B] transition-colors">03</span>
                  <span className="text-xs font-mono uppercase tracking-wider">Collections</span>
                </div>
                <div className="p-1 rounded-none bg-white/[0.03] group-hover:bg-[#09AE5B]/10 transition-colors">
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#09AE5B]" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#E5E5E5] group-hover:text-white transition-colors">
                {collections.length}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400">
                <span>Curated stacks</span>
                <span className="font-mono text-[9px] text-[#09AE5B]/70 tracking-widest uppercase">▲ STACKS</span>
              </div>
            </Link>

            <Link
              to="/projects"
              className="p-4 rounded-none bg-[#141519] border border-white/[0.06] hover:border-[#09AE5B]/30 hover:bg-[#16181d] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-neutral-500 group-hover:text-[#09AE5B] transition-colors">04</span>
                  <span className="text-xs font-mono uppercase tracking-wider">Projects</span>
                </div>
                <div className="p-1 rounded-none bg-white/[0.03] group-hover:bg-[#09AE5B]/10 transition-colors">
                  <FolderKanban className="w-3.5 h-3.5 text-[#09AE5B]" />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight text-[#E5E5E5] group-hover:text-white transition-colors">
                {projects.length}
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-neutral-400">
                <span>Workspaces</span>
                <span className="font-mono text-[9px] text-[#09AE5B]/70 tracking-widest uppercase">■ ACTIVE</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. RESOURCE CATEGORIES */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Resource Categories
            </h2>
            <span className="text-neutral-600 font-mono text-[10px]">// 06 PRIMARY TAXONOMIES</span>
          </div>
          <Link
            to="/library"
            className="text-xs text-neutral-400 hover:text-[#09AE5B] flex items-center gap-1 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {categoryPills.map((cat) => (
            <Link
              key={cat.type}
              to={`/library?type=${cat.type}`}
              className="p-3.5 rounded-none bg-[#121316] border border-white/[0.06] hover:border-[#09AE5B]/30 hover:bg-[#15171b] transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <span className="p-1.5 rounded-none bg-white/[0.04] text-[#09AE5B] group-hover:bg-[#09AE5B]/15 transition-colors">
                  {cat.icon}
                </span>
                <span className="text-[10px] font-mono text-neutral-500 group-hover:text-[#09AE5B] transition-colors border border-white/[0.04] px-1.5 py-0.5 bg-white/[0.02]">
                  {categoryCounts[cat.type] || 0}
                </span>
              </div>
              <div className="font-medium text-xs text-[#E5E5E5] group-hover:text-white truncate transition-colors">
                {cat.label}
              </div>
              <div className="text-[9px] font-mono text-neutral-500 mt-0.5 tracking-wider">
                CAT // {cat.index}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. STARRED QUICK ACCESS (Rendered when favorites exist) */}
      {favouriteResources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E5E5E5] font-mono">
                Pinned Favorites
              </h2>
              <span className="text-neutral-500 font-mono text-[10px]">
                // {favouriteResources.length} PINNED
              </span>
            </div>
            <Link
              to="/favourites"
              className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 transition-colors group"
            >
              <span>View All Favorites</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {favouriteResources.slice(0, 4).map((fav) => (
              <a
                key={fav._id}
                href={fav.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-none bg-[#121316] border border-white/[0.06] hover:border-amber-400/30 hover:bg-[#15171b] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider truncate">
                      {fav.type}
                    </span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                  </div>
                  <h3 className="font-semibold text-xs text-[#E5E5E5] group-hover:text-white truncate transition-colors">
                    {fav.title}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                    {fav.description || fav.url}
                  </p>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono pt-2 mt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="truncate">{fav.url?.replace(/^https?:\/\//, '')}</span>
                  <span className="text-[#09AE5B] group-hover:translate-x-0.5 transition-transform">↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 4. RECENTLY ADDED */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#09AE5B]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E5E5E5] font-mono">
              Recently Added
            </h2>
            <span className="text-neutral-500 font-mono text-[10px]">
              // LATEST ENTRIES
            </span>
          </div>
          <Link
            to="/recently-added"
            className="text-xs text-neutral-400 hover:text-[#09AE5B] flex items-center gap-1 transition-colors group"
          >
            <span>Timeline</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="p-12 rounded-none bg-[#121316] border border-white/[0.06] text-center text-xs text-neutral-400 font-mono flex flex-col items-center justify-center gap-3">
            <div className="w-5 h-5 border border-white/20 border-t-[#09AE5B] animate-spin" />
            <span>Loading recent resources...</span>
          </div>
        ) : recentResources.length === 0 ? (
          /* Editorial Blueprint Empty State */
          <div className="relative p-8 sm:p-12 rounded-none bg-[#121316] border border-white/[0.08] text-center overflow-hidden">
            {/* Corner Crosshairs */}
            <span className="absolute top-2 left-2 text-white/20 font-mono text-[10px] select-none">+</span>
            <span className="absolute top-2 right-2 text-white/20 font-mono text-[10px] select-none">+</span>
            <span className="absolute bottom-2 left-2 text-white/20 font-mono text-[10px] select-none">+</span>
            <span className="absolute bottom-2 right-2 text-white/20 font-mono text-[10px] select-none">+</span>

            {/* Architectural Blueprint Graphic */}
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-16 h-16 rounded-none border border-white/10 bg-[#0E0F10] flex items-center justify-center mb-4 relative">
                {/* SVG Blueprint Node */}
                <svg className="w-8 h-8 text-[#09AE5B] stroke-[1.25]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="0" strokeDasharray="2 2" stroke="currentColor" />
                  <path d="M7 8h10M7 12h6M7 16h8" stroke="white" strokeOpacity="0.4" />
                  <circle cx="17" cy="16" r="1.5" fill="#09AE5B" stroke="none" />
                </svg>
                <span className="absolute -top-1 -right-1 font-mono text-[8px] bg-neutral-800 text-neutral-400 border border-white/10 px-1">
                  SYS
                </span>
              </div>

              <div className="font-mono text-[10px] text-[#09AE5B] uppercase tracking-wider mb-1">
                INDEX // CATALOG_EMPTY
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#E5E5E5] tracking-tight">
                Your Library is Waiting for Its First Entry
              </h3>
              <p className="text-xs text-neutral-400 mt-1.5 max-w-sm leading-relaxed">
                Paste any GitHub repository, component library, UI kit, or documentation link to extract metadata and begin organizing your personal reference stack.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-quick-add'))}
                  className="inline-flex items-center gap-1.5 rounded-none bg-[#09AE5B] text-black font-semibold text-xs px-4 py-2 hover:bg-[#07914b] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add First Resource</span>
                </button>
                <Link
                  to="/library"
                  className="inline-flex items-center gap-1.5 rounded-none bg-[#1e2025] text-[#E5E5E5] hover:text-white font-medium text-xs px-4 py-2 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Explore Catalog</span>
                </Link>
              </div>

              {/* Keyboard Shortcut Tips */}
              <div className="mt-6 pt-5 border-t border-white/[0.04] w-full flex items-center justify-center gap-4 text-[11px] font-mono text-neutral-500">
                <span>Tip: Press <kbd className="px-1.5 py-0.5 border border-white/10 bg-white/[0.03] text-neutral-300">N</kbd> anywhere for Quick Add</span>
                <span className="text-white/10">•</span>
                <span><kbd className="px-1.5 py-0.5 border border-white/10 bg-white/[0.03] text-neutral-300">⌘K</kbd> to search</span>
              </div>
            </div>
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

      {/* 5. COLLECTIONS OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-3.5 h-3.5 text-[#09AE5B]" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E5E5E5] font-mono">
              Collections Overview
            </h2>
            <span className="text-neutral-500 font-mono text-[10px]">
              // CURATED STACKS
            </span>
          </div>
          <Link
            to="/collections"
            className="text-xs text-neutral-400 hover:text-[#09AE5B] flex items-center gap-1 transition-colors group"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {collections.length === 0 ? (
          /* Thoughtful Minimal Blueprint for Collections */
          <div className="p-6 rounded-none bg-[#121316] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-none bg-[#0E0F10] border border-white/10 text-[#09AE5B] shrink-0">
                <BookmarkCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-[#E5E5E5]">
                  Organize your resources into project stacks
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5 max-w-lg">
                  Collections let you group related UI kits, frameworks, and APIs into cohesive topic bundles (e.g. &ldquo;Design System&rdquo;, &ldquo;Next.js Stack&rdquo;, &ldquo;CLI Utilities&rdquo;).
                </p>
              </div>
            </div>
            <Link
              to="/collections"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-none bg-[#1e2025] hover:bg-[#252830] text-[#E5E5E5] border border-white/10 font-semibold text-xs px-3.5 py-1.5 transition-colors"
            >
              <Plus className="w-3 h-3 text-[#09AE5B]" />
              <span>Create Collection</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {collections.slice(0, 4).map((col) => (
              <Link
                key={col._id}
                to={`/collections/${col._id}`}
                className="p-4 rounded-none bg-[#121316] border border-white/[0.06] hover:border-[#09AE5B]/30 hover:bg-[#15171b] transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-none"
                      style={{ backgroundColor: col.color || '#09AE5B' }}
                    />
                    <span className="text-[10px] font-mono text-[#09AE5B] px-2 py-0.5 rounded-none bg-[#09AE5B]/10 border border-[#09AE5B]/20">
                      {col.resourceCount || 0} items
                    </span>
                  </div>
                  <h3 className="font-semibold text-xs text-[#E5E5E5] group-hover:text-white truncate transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                    {col.description || 'No description provided.'}
                  </p>
                </div>
                <div className="text-[10px] text-neutral-400 font-mono pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between">
                  <span>Open collection</span>
                  <span className="text-[#09AE5B] group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 6. EDITORIAL WORKBENCH FOOTER STRIP */}
      <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-neutral-500 gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-[#09AE5B]"></span>
            <span className="text-neutral-400">SHELFSPACE WORKBENCH</span>
          </span>
          <span className="text-white/10">•</span>
          <span>TAXONOMY ENGINE</span>
          <span className="text-white/10">•</span>
          <span>AUTOSAVE ON</span>
        </div>
        <div className="flex items-center gap-2 text-neutral-500">
          <span>SHORTCUTS:</span>
          <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-white/10 text-neutral-300">⌘K</kbd>
          <span>COMMAND</span>
          <span className="text-white/10">•</span>
          <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-white/10 text-neutral-300">N</kbd>
          <span>QUICK ADD</span>
        </div>
      </div>

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
