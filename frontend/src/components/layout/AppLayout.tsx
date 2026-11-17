import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  FolderKanban,
  BookmarkCheck,
  Star,
  Settings,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  User,
  ChevronsUpDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { CommandPalette } from '../search/CommandPalette';
import { ResourceModal } from '../resources/ResourceModal';
import { apiClient } from '../../api/client';
import type { Collection } from '../../types';
import { cn } from '../../lib/utils';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Expandable categories state in sidebar
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  // Bottom account dropdown state
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Categories list for modal
  const [categories, setCategories] = useState<Collection[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/collections');
      if (res.data?.success) setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    const handleCategoryUpdate = () => fetchCategories();
    window.addEventListener('categories-updated', handleCategoryUpdate);
    return () => window.removeEventListener('categories-updated', handleCategoryUpdate);
  }, [location.pathname]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for open-add-resource / open-quick-add custom events
  useEffect(() => {
    const handleOpen = () => {
      setIsAddModalOpen(true);
    };
    window.addEventListener('open-add-resource', handleOpen);
    window.addEventListener('open-quick-add', handleOpen);
    return () => {
      window.removeEventListener('open-add-resource', handleOpen);
      window.removeEventListener('open-quick-add', handleOpen);
    };
  }, []);

  // Navigation items with Projects between All Resources and Categories
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'All Resources', icon: Layers },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/categories', label: 'Categories', icon: BookmarkCheck },
    { to: '/favourites', label: 'Favorites', icon: Star },
  ];

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{ minHeight: "100vh", width: "100%", position: "relative" }}
      className="flex text-[#E5E5E5] font-sans selection:bg-[#09AE5B] selection:text-black overflow-x-hidden"
    >
      <div
        style={{
          position: "fixed",
          inset: "0",
          zIndex: 0,
          backgroundColor: "#000",
          backgroundImage:
            "repeating-linear-gradient(60deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(120deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 30px)",
          pointerEvents: "none",
        }}
      />
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-white/[0.08] bg-[#101114] transition-all duration-150 ease-in-out md:sticky md:top-0 md:h-screen select-none shrink-0',
          isCollapsed ? 'w-16' : 'w-56',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden justify-between">
          <div>
            {/* 1. TOP — BRAND */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.08] shrink-0 bg-[#101114]">
              {!isCollapsed ? (
                <div className="flex items-center justify-between w-full">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-1 py-1 rounded-md hover:bg-white/[0.04] transition-colors truncate"
                  >
                    <div className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0">
                      <span className="w-2 h-2 rounded-full bg-[#09AE5B]"></span>
                    </div>
                    <span className="text-xs font-semibold text-[#EDEDED] tracking-tight truncate">
                      Shelfspace
                    </span>
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

            {/* 2. MIDDLE — NAVIGATION (With Expandable Categories) */}
            <div className="px-2 py-3 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;

                // Expandable Categories Navigation Item
                if (item.to === '/categories' && !isCollapsed) {
                  const isCatSectionActive =
                    location.pathname.startsWith('/categories') ||
                    location.pathname.startsWith('/collections');
                  return (
                    <div key={item.to} className="space-y-0.5">
                      <div
                        className={cn(
                          'group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-150',
                          isCatSectionActive
                            ? 'bg-white/[0.08] text-white border-l-2 border-[#09AE5B] pl-2 shadow-xs'
                            : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                        )}
                      >
                        <NavLink
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <BookmarkCheck className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsCategoriesExpanded(!isCategoriesExpanded);
                          }}
                          className="p-1 -mr-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title={isCategoriesExpanded ? 'Collapse categories' : 'Expand categories'}
                        >
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-150',
                              !isCategoriesExpanded && '-rotate-90'
                            )}
                          />
                        </button>
                      </div>

                      {/* Expandable Category Tree */}
                      {isCategoriesExpanded && (
                        <div className="pl-5 pr-1 py-0.5 space-y-0.5 animate-in fade-in duration-150">
                          {categories.map((cat) => {
                            const isCatActive =
                              location.pathname === `/categories/${cat._id}` ||
                              location.pathname === `/collections/${cat._id}`;
                            return (
                              <Link
                                key={cat._id}
                                to={`/categories/${cat._id}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={cn(
                                  'flex items-center justify-between px-2 py-1.5 rounded text-[11px] transition-colors',
                                  isCatActive
                                    ? 'bg-white/[0.08] text-white font-medium border-l border-[#09AE5B]'
                                    : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                                )}
                                title={cat.name}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: cat.color || '#09AE5B' }}
                                  />
                                  <span className="truncate">{cat.name}</span>
                                </div>
                                {cat.resourceCount !== undefined && cat.resourceCount > 0 && (
                                  <span className="text-[10px] text-neutral-500 font-mono pl-1">
                                    {cat.resourceCount}
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                          {categories.length === 0 && (
                            <div className="px-2 py-1 text-[11px] text-neutral-500 italic">
                              No categories yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Standard navigation item (or collapsed category icon)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-150',
                        isActive
                          ? 'bg-white/[0.08] text-white border-l-2 border-[#09AE5B] pl-2 shadow-xs'
                          : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white',
                        isCollapsed && 'justify-center px-0 border-l-0'
                      )
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* 3. BOTTOM — ACCOUNT (With Refined Divider & Compact Dropdown) */}
          <div className="p-2 border-t border-white/[0.08] bg-[#101114] relative" ref={accountMenuRef}>
            {/* Account Popover Menu */}
            {isAccountMenuOpen && (
              <div
                className={cn(
                  'absolute bottom-full mb-2 rounded-md bg-[#16171b] border border-white/[0.08] shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150',
                  isCollapsed ? 'left-2 w-48' : 'inset-x-2'
                )}
              >
                <div className="px-3 py-2 border-b border-white/[0.06] text-xs">
                  <p className="font-medium text-[#EDEDED] truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-white/[0.06] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}

            {/* Account Trigger Button */}
            {!isCollapsed ? (
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-full flex items-center justify-between p-1.5 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer text-left group"
                title="Account menu"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-1">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 border border-white/10 text-white font-medium flex items-center justify-center text-xs shrink-0 font-mono">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-medium text-[#EDEDED] truncate block leading-tight group-hover:text-white">
                      {user?.name || 'Account'}
                    </span>
                    <span className="text-[10px] text-neutral-500 truncate block leading-tight">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <ChevronsUpDown className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300 shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-full flex items-center justify-center p-2 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer text-neutral-400 hover:text-white"
                title={`${user?.name || 'Account'} (${user?.email || ''})`}
              >
                <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/10 text-white font-medium flex items-center justify-center text-xs shrink-0 font-mono">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ==================== MAIN VIEW AREA ==================== */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Top Header: Compact Global Search */}
        <header className="h-14 border-b border-white/[0.08] bg-[#000]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-neutral-400 hover:text-white p-1 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Compact Global Search */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 h-8 px-3 rounded-md bg-[#121316] border border-white/[0.08] text-xs text-neutral-400 hover:border-white/20 hover:text-white transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-neutral-500 border border-white/[0.08]">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      {/* Centered Add Resource Modal */}
      <ResourceModal
        isOpen={isAddModalOpen}
        categories={categories}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchCategories();
          window.dispatchEvent(new CustomEvent('resource-added'));
        }}
        onCategoryCreated={(newCat) => {
          setCategories((prev) => [...prev, newCat]);
        }}
      />
    </div>
  );
};

export default AppLayout;
