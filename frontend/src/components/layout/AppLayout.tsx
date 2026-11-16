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
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CommandPalette } from '../search/CommandPalette';
import { QuickAddDrawer } from '../resources/QuickAddDrawer';
import { Button } from '../ui/Button';
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
    <div className="min-h-screen flex bg-[#fbfbfa] dark:bg-[#0d0d0f] text-[#2b2a28] dark:text-[#f4f4f5] font-sans transition-colors duration-150">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* NOTION-STYLE SIDEBAR */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-[#ececeb] dark:border-[#222227] bg-[#f7f7f5] dark:bg-[#131316] transition-all duration-200 ease-in-out md:static select-none',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* 1. Workspace Switcher Header */}
          <div className="flex items-center justify-between h-13 px-3.5 border-b border-[#ececeb] dark:border-[#222227] shrink-0">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-1.5 py-1 rounded-md hover:bg-[#efefed] dark:hover:bg-[#1e1e24] transition-colors truncate group"
                >
                  <div className="w-6 h-6 rounded-md bg-[#191919] dark:bg-white text-white dark:text-zinc-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    S
                  </div>
                  <div className="truncate text-left">
                    <span className="text-xs font-semibold text-[#2b2a28] dark:text-[#f4f4f5] tracking-tight truncate block">
                      {user?.name ? `${user.name.split(' ')[0]}'s Shelf` : 'Shelfspace'}
                    </span>
                    <span className="text-[10px] text-[#8e8d8a] dark:text-[#71717a] block leading-none">
                      Personal Workspace
                    </span>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-[#f4f4f5] p-1.5 rounded-md hover:bg-[#efefed] dark:hover:bg-[#1e1e24] cursor-pointer"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden text-[#8e8d8a] p-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-[#f4f4f5] p-1.5 rounded-md hover:bg-[#efefed] dark:hover:bg-[#1e1e24] cursor-pointer"
                  title="Expand sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* 2. Quick Search & Quick Add CTA */}
          <div className="p-2.5 space-y-1.5 shrink-0">
            <button
              onClick={() => setIsCommandOpen(true)}
              className={cn(
                'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-[#787774] dark:text-[#a1a1aa] bg-[#f0f0ee] dark:bg-[#1a1a1f] hover:bg-[#e9e9e7] dark:hover:bg-[#222229] transition-colors cursor-pointer border border-[#e5e5e3] dark:border-[#26262e]',
                isCollapsed && 'justify-center px-0'
              )}
              title="Search (⌘K)"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">Search</span>
                  <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-white dark:bg-[#2a2a32] text-[#8e8d8a] dark:text-[#71717a] border border-[#dededb] dark:border-[#383844]">
                    ⌘K
                  </kbd>
                </>
              )}
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsQuickAddOpen(true)}
              className={cn('w-full justify-center text-xs h-8 shadow-xs', isCollapsed && 'px-0')}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {!isCollapsed && <span>Quick Add</span>}
            </Button>
          </div>

          {/* 3. Navigation Sections (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
            {/* WORKSPACE GROUP */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9b9a97] dark:text-[#71717a]">
                  Workspace
                </div>
              )}
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Home' : undefined}
              >
                <Home className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Home</span>}
              </NavLink>

              <NavLink
                to="/library"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'All Resources' : undefined}
              >
                <Layers className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>All Resources</span>}
              </NavLink>
            </div>

            {/* COLLECTIONS & PROJECTS GROUP */}
            <div className="space-y-0.5">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9b9a97] dark:text-[#71717a]">
                  <span>Collections</span>
                  <Link
                    to="/collections"
                    className="hover:text-[#2b2a28] dark:hover:text-white transition-colors"
                  >
                    View All
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
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Collections' : undefined}
              >
                <BookmarkCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                {!isCollapsed && <span>All Collections</span>}
              </NavLink>

              <NavLink
                to="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Projects' : undefined}
              >
                <FolderKanban className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                {!isCollapsed && <span>Projects</span>}
              </NavLink>

              {/* Direct collection items */}
              {!isCollapsed && collections.length > 0 && (
                <div className="pl-3 pr-1 pt-1 space-y-0.5 border-l border-[#ececeb] dark:border-[#222227] ml-3.5 my-1">
                  {collections.slice(0, 6).map((col) => (
                    <NavLink
                      key={col._id}
                      to={`/collections/${col._id}`}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-2 py-1 rounded text-xs transition-colors',
                          isActive
                            ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-medium'
                            : 'text-[#6f6e6b] dark:text-[#94949e] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: col.color || '#10b981' }}
                        />
                        <span className="truncate">{col.name}</span>
                      </div>
                      {col.resourceCount !== undefined && col.resourceCount > 0 && (
                        <span className="text-[10px] font-mono text-[#9b9a97] dark:text-[#63636e]">
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
                <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#9b9a97] dark:text-[#71717a]">
                  Favorites & History
                </div>
              )}
              <NavLink
                to="/favourites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Favorites' : undefined}
              >
                <Star className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500/20" />
                {!isCollapsed && <span>Favorites</span>}
              </NavLink>

              <NavLink
                to="/recently-added"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Recently Added' : undefined}
              >
                <Clock className="w-4 h-4 shrink-0 text-purple-500" />
                {!isCollapsed && <span>Recently Added</span>}
              </NavLink>

              <NavLink
                to="/trash"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                      : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
                    isCollapsed && 'justify-center px-0'
                  )
                }
                title={isCollapsed ? 'Trash' : undefined}
              >
                <Trash2 className="w-4 h-4 shrink-0 text-zinc-400" />
                {!isCollapsed && <span>Trash</span>}
              </NavLink>
            </div>
          </div>

          {/* 4. Bottom Controls: User Profile & Settings */}
          <div className="p-2 border-t border-[#ececeb] dark:border-[#222227] space-y-0.5 shrink-0 bg-[#f7f7f5] dark:bg-[#131316]">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[#eaeae7] dark:bg-[#202026] text-[#191919] dark:text-white font-semibold'
                    : 'text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white',
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
                'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#5f5e5b] dark:text-[#a1a1aa] hover:bg-[#efefed] dark:hover:bg-[#1a1a20] hover:text-[#2b2a28] dark:hover:text-white transition-colors cursor-pointer',
                isCollapsed && 'justify-center px-0'
              )}
              title={`Theme: ${theme}`}
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 shrink-0 text-amber-400" />
              ) : theme === 'light' ? (
                <Sun className="w-4 h-4 shrink-0 text-amber-500" />
              ) : (
                <Laptop className="w-4 h-4 shrink-0" />
              )}
              {!isCollapsed && <span className="capitalize">{theme} Theme</span>}
            </button>

            {/* User profile brief & logout button */}
            {!isCollapsed ? (
              <div className="pt-2 mt-1 border-t border-[#ececeb] dark:border-[#222227] flex items-center justify-between px-1.5">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-[#191919] dark:bg-white text-white dark:text-zinc-950 font-semibold flex items-center justify-center text-[11px] shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate text-left">
                    <span className="text-xs font-medium text-[#2b2a28] dark:text-[#f4f4f5] truncate block leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[10px] text-[#8e8d8a] dark:text-[#71717a] truncate block leading-tight">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="text-[#8e8d8a] hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
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
                className="w-full flex items-center justify-center p-1.5 rounded text-[#8e8d8a] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfa] dark:bg-[#0d0d0f]">
        {/* Notion-style Top Header */}
        <header className="h-13 border-b border-[#ececeb] dark:border-[#222227] bg-[#fbfbfa]/90 dark:bg-[#0d0d0f]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-[#f4f4f5] p-1 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-xs text-[#8e8d8a] dark:text-[#71717a]">
              <span className="hover:text-[#2b2a28] dark:hover:text-[#f4f4f5] transition-colors cursor-default">
                Shelfspace
              </span>
              <span>/</span>
              <span className="text-[#2b2a28] dark:text-[#f4f4f5] font-semibold cursor-default">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command search trigger button */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 h-8 px-2.5 rounded-md bg-[#f2f2ef] dark:bg-[#18181c] border border-[#e5e5e3] dark:border-[#27272e] text-xs text-[#787774] dark:text-[#a1a1aa] hover:border-[#cfcfcc] dark:hover:border-[#383842] transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-white dark:bg-[#25252b] border border-[#dededb] dark:border-[#33333d]">
                ⌘K
              </kbd>
            </button>

            <Link
              to="/"
              className="text-xs text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-[#f4f4f5] hidden md:inline-flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-[#f2f2ef] dark:hover:bg-[#18181c] transition-colors"
              title="View public website"
            >
              <span>Landing Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Button
              variant="primary"
              size="sm"
              pill
              onClick={() => setIsQuickAddOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs h-8 px-3.5 font-medium shadow-xs"
            >
              <span>Add Resource</span>
              <kbd className="hidden lg:inline text-[10px] opacity-75 font-mono ml-1">N</kbd>
            </Button>
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
