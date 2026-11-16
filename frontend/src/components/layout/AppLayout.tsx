import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Home,
  Layers,
  FolderKanban,
  BookmarkCheck,
  Star,
  Clock,
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
  const { theme, setTheme } = useTheme();
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
    { to: '/dashboard', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { to: '/library', label: 'My Library', icon: <Layers className="w-4 h-4" /> },
    { to: '/projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { to: '/collections', label: 'Collections', icon: <BookmarkCheck className="w-4 h-4" /> },
    { to: '/favourites', label: 'Favourites', icon: <Star className="w-4 h-4" /> },
    { to: '/recently-added', label: 'Recently Added', icon: <Clock className="w-4 h-4" /> },
  ];

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f5] dark:bg-[#121110] text-[#191715] dark:text-[#f5f2ec] font-sans transition-colors duration-200">
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
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-[#e6e0d5] dark:border-[#2b2824] bg-white dark:bg-[#191816] transition-all duration-200 ease-in-out md:static',
          isCollapsed ? 'w-16' : 'w-60',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#e6e0d5] dark:border-[#2b2824]">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1e3a2f] text-[#f5f2ec] dark:bg-[#2d5d45] font-bold flex items-center justify-center text-xs shadow-xs border border-[#142820] dark:border-[#3d7d5d]/40">
                S
              </div>
              {!isCollapsed && (
                <span className="font-semibold text-sm tracking-tight text-[#191715] dark:text-[#f5f2ec]">
                  Shelfspace
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] p-1 rounded-md hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-[#8a8277] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add CTA in Sidebar */}
          <div className="px-3 pt-3 pb-2">
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
          <nav className="px-2 space-y-0.5 mt-2">
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
                      ? 'bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] font-semibold'
                      : 'text-[#57524b] dark:text-[#aba499] hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] hover:text-[#191715] dark:hover:text-[#f5f2ec]',
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
              <div className="flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-wider text-[#8a8277] mb-1.5">
                <span>Collections</span>
                <NavLink to="/collections" className="text-[#1e3a2f] dark:text-[#86efac] hover:underline">
                  All
                </NavLink>
              </div>
              <div className="space-y-0.5 max-h-36 overflow-y-auto pr-1">
                {collections.map((col) => (
                  <NavLink
                    key={col._id}
                    to={`/collections/${col._id}`}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-[#57524b] dark:text-[#aba499] hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="truncate">{col.name}</span>
                    </div>
                    {col.resourceCount !== undefined && col.resourceCount > 0 && (
                      <span className="text-[10px] text-[#8a8277] font-mono">
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
        <div className="p-3 border-t border-[#e6e0d5] dark:border-[#2b2824] space-y-1">
          {/* Settings */}
          <NavLink
            to="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#57524b] dark:text-[#aba499] hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors',
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
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#57524b] dark:text-[#aba499] hover:bg-[#f5f2eb] dark:hover:bg-[#201e1b] hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors cursor-pointer',
              isCollapsed && 'justify-center px-0'
            )}
            title={`Current theme: ${theme} (Click to toggle)`}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 shrink-0 text-amber-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 shrink-0 text-amber-600" />
            ) : (
              <Laptop className="w-4 h-4 shrink-0" />
            )}
            {!isCollapsed && <span className="capitalize">{theme} Theme</span>}
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#8a8277] hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 transition-colors cursor-pointer',
              isCollapsed && 'justify-center px-0'
            )}
            title="Log Out"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Log Out</span>}
          </button>

          {/* User profile brief */}
          {!isCollapsed && user && (
            <div className="pt-2 px-2 border-t border-[#ede8df] dark:border-[#24221f] flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] font-bold flex items-center justify-center text-xs shrink-0 border border-[#cadfd5] dark:border-[#2d4d3c]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate text-xs">
                <div className="font-medium text-[#191715] dark:text-[#f5f2ec] truncate">{user.name}</div>
                <div className="text-[10px] text-[#8a8277] truncate">{user.email}</div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b border-[#e6e0d5] dark:border-[#2b2824] bg-white/85 dark:bg-[#191816]/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] p-1 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar (Trigger for Command Palette) */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center justify-between h-9 px-3 rounded-lg bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] text-xs text-[#8a8277] hover:border-[#1e3a2f] dark:hover:border-[#387356] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span>Search resources, tags, projects...</span>
              </div>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-[#201e1b] rounded border border-[#ded8cb] dark:border-[#2f2c27] text-[#8a8277]">
                <span>⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="text-xs text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hidden sm:inline-flex items-center gap-1 font-medium mr-1"
              title="View public landing page"
            >
              <span>Public Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

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
          window.dispatchEvent(new CustomEvent('resource-added'));
        }}
      />
    </div>
  );
};
