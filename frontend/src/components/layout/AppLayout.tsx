import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Home,
  Layers,
  FolderKanban,
  BookmarkCheck,
  Star,
  Clock,
  Trash2,
  Settings,
  Plus,
  Search,
  Moon,
  Sun,
  Laptop,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CommandPalette } from '../search/CommandPalette';
import { QuickAddDrawer } from '../resources/QuickAddDrawer';
import { apiClient } from '../../api/client';
import type { Project, Collection } from '../../types';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialUrl, setQuickAddInitialUrl] = useState('');

  // Workspace data for selectors
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const fetchWorkspaceData = async () => {
    try {
      const [projRes, colRes] = await Promise.all([
        apiClient.get('/projects'),
        apiClient.get('/collections'),
      ]);
      if (projRes.data?.success) setProjects(projRes.data.data);
      if (colRes.data?.success) setCollections(colRes.data.data);
    } catch (err) {
      console.error('Failed to load workspace projects and collections', err);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for search, N for quick add)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      if (
        e.key.toLowerCase() === 'n' &&
        !['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())
      ) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for open-quick-add custom events (e.g. from Dashboard quick capture)
  useEffect(() => {
    const handleOpenQuickAdd = (e: any) => {
      setQuickAddInitialUrl(e.detail?.url || '');
      setIsQuickAddOpen(true);
    };
    window.addEventListener('open-quick-add', handleOpenQuickAdd);
    return () => window.removeEventListener('open-quick-add', handleOpenQuickAdd);
  }, []);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  // Compute page title breadcrumbs
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview';
    if (path.startsWith('/library')) return 'All Resources';
    if (path.startsWith('/collections')) return 'Collections';
    if (path.startsWith('/projects')) return 'Projects';
    if (path === '/favourites') return 'Favorites';
    if (path === '/recently-added') return 'Recently Added';
    if (path === '/trash') return 'Trash';
    if (path === '/settings') return 'Settings & Security';
    return 'Workspace';
  };

  return (
    <div className="relative min-h-screen flex bg-[#0E0F10] text-[#E5E5E5] font-sans selection:bg-[#09AE5B] selection:text-black">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MINIMAL LINEAR-STYLE SIDEBAR */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-white/[0.08] bg-[#0E0F10] transition-all duration-150 ease-in-out md:static select-none',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* 1. Header / Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.08] shrink-0 bg-[#0E0F10]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-1 py-1 rounded-md hover:bg-white/[0.04] transition-colors truncate group"
                >
                  <div className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#09AE5B]"></span>
                  </div>
                  <div className="truncate text-left">
                    <span className="text-xs font-semibold text-[#E5E5E5] tracking-tight truncate block group-hover:text-white transition-colors">
                      {user?.name ? `${user.name.split(' ')[0]}'s Shelf` : 'Shelfspace'}
                    </span>
                    <span className="text-[10px] text-neutral-500 block leading-none">
                      Library
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden text-neutral-400 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="text-neutral-400 hover:text-white p-1.5 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors"
                  title="Expand sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Quick Search & Quick Add CTA */}
          <div className="p-3 space-y-2 shrink-0">
            <button
              onClick={() => setIsCommandOpen(true)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-neutral-400 bg-[#141519] hover:bg-[#18191e] hover:text-neutral-200 transition-colors cursor-pointer border border-white/[0.06]',
                isCollapsed && 'justify-center px-0'
              )}
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left text-xs">Search...</span>
                  <kbd className="text-[10px] font-mono px-1 py-0.5 rounded-md bg-black/40 text-neutral-500 border border-white/[0.08]">
                    ⌘K
                  </kbd>
                </>
              )}
            </button>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className={cn(
                'w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold text-xs h-8 px-3 transition-colors cursor-pointer',
                isCollapsed && 'px-0'
              )}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              {!isCollapsed && <span>Add Resource</span>}
            </button>
          </div>

          {/* 3. Navigation Sections (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
            {/* MAIN NAVIGATION */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  Navigation
                </div>
              )}
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Overview' : undefined}
              >
                <Home className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Overview</span>}
              </NavLink>

              <NavLink
                to="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Resources' : undefined}
              >
                <Layers className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Resources</span>}
              </NavLink>
            </div>

            {/* ORGANIZATION GROUP */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  <span>Organization</span>
                  <Link
                    to="/collections"
                    className="hover:text-white transition-colors text-[10px] lowercase"
                  >
                    all
                  </Link>
                </div>
              )}

              <NavLink
                to="/collections"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Collections' : undefined}
              >
                <BookmarkCheck className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Collections</span>}
              </NavLink>

              <NavLink
                to="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Projects' : undefined}
              >
                <FolderKanban className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Projects</span>}
              </NavLink>

              {/* Direct collection items */}
              {!isCollapsed && collections.length > 0 && (
                <div className="pl-3 pr-1 pt-1 space-y-0.5 border-l border-white/[0.06] ml-3.5 my-1">
                  {collections.slice(0, 5).map((col) => (
                    <NavLink
                      key={col._id}
                      to={`/collections/${col._id}`}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors',
                          isActive
                            ? 'bg-white/[0.06] text-white font-medium'
                            : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200'
                        )
                      }
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: col.color || '#09AE5B' }}
                        />
                        <span className="truncate">{col.name}</span>
                      </div>
                      {col.resourceCount !== undefined && col.resourceCount > 0 && (
                        <span className="text-[10px] font-mono text-neutral-500">
                          {col.resourceCount}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* QUICK ACCESS GROUP */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                  Quick Access
                </div>
              )}
              <NavLink
                to="/favourites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Favorites' : undefined}
              >
                <Star className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>Favorites</span>}
              </NavLink>

              <NavLink
                to="/recently-added"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Recently Added' : undefined}
              >
                <Clock className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Recently Added</span>}
              </NavLink>

              <NavLink
                to="/trash"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-white/[0.08] text-white'
                      : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Trash' : undefined}
              >
                <Trash2 className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Trash</span>}
              </NavLink>
            </div>
          </div>

          {/* 4. Bottom Controls: User Profile & Settings */}
          <div className="p-3 border-t border-white/[0.08] space-y-1 shrink-0 bg-[#0E0F10]">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-white/[0.08] text-white'
                    : 'text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200',
                  isCollapsed && 'justify-center px-0'
                )
              }
              title={isCollapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Settings</span>}
            </NavLink>

            <button
              onClick={cycleTheme}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-colors cursor-pointer',
                isCollapsed && 'justify-center px-0'
              )}
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 shrink-0 text-neutral-400" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4 shrink-0 text-amber-400" />
              ) : (
                <Laptop className="w-4 h-4 shrink-0 text-neutral-400" />
              )}
              {!isCollapsed && <span className="capitalize">{theme} Theme</span>}
            </button>

            {/* User profile brief & logout button */}
            {!isCollapsed ? (
              <div className="pt-2 mt-1 border-t border-white/[0.06] flex items-center justify-between px-1">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/10 text-white font-semibold flex items-center justify-center text-xs shrink-0 font-mono">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate text-left">
                    <span className="text-xs font-medium text-[#E5E5E5] truncate block leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-neutral-500 truncate block leading-tight">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="text-neutral-400 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="w-full flex items-center justify-center p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] cursor-pointer transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0E0F10]">
        {/* Clean Top Header */}
        <header className="h-14 border-b border-white/[0.08] bg-[#0E0F10] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Shelfspace
              </Link>
              <span className="text-neutral-600">/</span>
              <span className="text-[#E5E5E5] font-medium">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md bg-[#141519] border border-white/[0.08] text-xs text-neutral-400 hover:border-white/20 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-black/50 text-neutral-500 border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/"
              className="text-xs text-neutral-400 hover:text-white hidden md:inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors"
              title="View public website"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setIsQuickAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#09AE5B] hover:bg-[#07914b] text-black font-semibold text-xs h-8 px-3.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Resource</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      {/* Quick Add Side Drawer */}
      <QuickAddDrawer
        isOpen={isQuickAddOpen}
        initialUrl={quickAddInitialUrl}
        onClose={() => {
          setIsQuickAddOpen(false);
          setQuickAddInitialUrl('');
        }}
        projects={projects}
        collections={collections}
        onSuccess={() => {
          fetchWorkspaceData();
          window.dispatchEvent(new CustomEvent('resource-added'));
        }}
      />
    </div>
  );
};
