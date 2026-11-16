import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
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
  Palette,
  Layout,
  Code2,
  Database,
  BookOpen,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CommandPalette } from '../search/CommandPalette';
import { QuickAddDrawer } from '../resources/QuickAddDrawer';
import { Button } from '../ui/Button';
import { apiClient } from '../../api/client';
import { Project, Collection } from '../../types';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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
      // Cmd+K or Ctrl+K for search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
      // 'n' key (when not focused in an input/textarea)
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

  const navLinks = [
    { to: '/library', label: 'My Library', icon: <Layers className="w-4 h-4" /> },
    { to: '/projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { to: '/collections', label: 'Collections', icon: <BookmarkCheck className="w-4 h-4" /> },
    { to: '/favourites', label: 'Favourites', icon: <Star className="w-4 h-4" /> },
    { to: '/recently-added', label: 'Recently Added', icon: <Clock className="w-4 h-4" /> },
    { to: '/trash', label: 'Trash', icon: <Trash2 className="w-4 h-4" /> },
  ];

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  return (
    <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-200">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 transition-all duration-200 ease-in-out md:static',
          isCollapsed ? 'w-16' : 'w-64',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <NavLink to="/library" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs border border-blue-500/30">
                S
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                    Shelfspace
                  </span>
                </div>
              )}
            </NavLink>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-zinc-400 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Status Badge */}
          {!isCollapsed && (
            <div className="px-4 py-2.5 my-2 mx-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-300 font-medium truncate">
                  Personal Library
                </span>
              </div>
            </div>
          )}

          {/* Quick Add Button in Sidebar */}
          <div className="px-3 pt-2 pb-3">
            <Button
              className={cn('w-full justify-center', isCollapsed && 'px-0')}
              size="sm"
              onClick={() => setIsQuickAddOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {!isCollapsed && <span>Quick Add</span>}
            </Button>
          </div>

          {/* Nav Links */}
          <nav className="px-2 space-y-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? link.label : undefined}
                >
                  <span className="shrink-0">{link.icon}</span>
                  {!isCollapsed && <span>{link.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Collections Section */}
          {!isCollapsed && collections.length > 0 && (
            <div className="mt-6 px-3">
              <div className="flex items-center justify-between px-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                <span>Collections</span>
                <NavLink to="/collections" className="text-blue-500 hover:underline">
                  All
                </NavLink>
              </div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto pr-1">
                {collections.map((col) => (
                  <NavLink
                    key={col._id}
                    to={`/collections/${col._id}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="truncate">{col.name}</span>
                    </div>
                    {col.resourceCount !== undefined && col.resourceCount > 0 && (
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {col.resourceCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-1">
          <NavLink
            to="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            title="Settings & Sessions"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>

          {/* Theme switcher */}
          <button
            onClick={cycleTheme}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            title={`Current theme: ${theme} (Click to toggle)`}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 shrink-0 text-blue-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 shrink-0 text-amber-500" />
            ) : (
              <Laptop className="w-4 h-4 shrink-0" />
            )}
            {!isCollapsed && <span className="capitalize">{theme} Theme</span>}
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors',
              isCollapsed && 'justify-center px-0'
            )}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>

          {/* User profile brief */}
          {!isCollapsed && user && (
            <div className="pt-2 px-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold flex items-center justify-center text-xs shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate text-xs">
                <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{user.name}</div>
                <div className="text-[10px] text-zinc-400 truncate">{user.email}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar (Trigger for Command Palette) */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center justify-between h-9 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Quick search resources, tags, projects...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              onClick={() => setIsQuickAddOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span>Add Resource</span>
              <kbd className="hidden md:inline text-[10px] opacity-75 font-mono ml-1">N</kbd>
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
        onClose={() => setIsQuickAddOpen(false)}
        projects={projects}
        collections={collections}
        onSuccess={() => {
          fetchWorkspaceData();
          // Dispatch custom event to notify active pages to refresh their list
          window.dispatchEvent(new CustomEvent('resource-added'));
        }}
      />
    </div>
  );
};
