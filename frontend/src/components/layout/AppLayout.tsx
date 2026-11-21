import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  ChevronsUpDown,
  Plus,
} from 'lucide-react';
import { Flaticon } from '../ui/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { CommandPalette } from '../search/CommandPalette';
import { ResourceModal } from '../resources/ResourceModal';
import { CreateCollectionModal } from '../collections/CreateCollectionModal';
import { CreateProjectModal } from '../projects/CreateProjectModal';
import { apiClient } from '../../api/client';
import type { Collection } from '../../types';
import { cn } from '../../lib/utils';
import { ShelfspaceLogoIcon } from '../ui/ShelfspaceLogo';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Collection and Project creation modals
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [collectionModalTab, setCollectionModalTab] = useState<'premade' | 'custom'>('premade');
  const [collectionModalType, setCollectionModalType] = useState<'category' | 'collection'>('collection');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  // Expandable categories state in sidebar
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(true);

  // Bottom account dropdown state
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Categories list for modal
  const [categories, setCategories] = useState<Collection[]>([]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/collections', { params: { type: 'category' } });
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
    const handleOpenCollectionModal = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: 'premade' | 'custom' }>;
      setCollectionModalTab(customEvent.detail?.tab || 'premade');
      setIsCollectionModalOpen(true);
    };
    const handleOpenCreateProject = () => {
      setIsCreateProjectOpen(true);
    };

    window.addEventListener('open-add-resource', handleOpen);
    window.addEventListener('open-quick-add', handleOpen);
    window.addEventListener('open-create-collection', handleOpenCollectionModal as EventListener);
    window.addEventListener('open-template-modal', handleOpenCollectionModal as EventListener);
    window.addEventListener('open-create-project', handleOpenCreateProject);

    return () => {
      window.removeEventListener('open-add-resource', handleOpen);
      window.removeEventListener('open-quick-add', handleOpen);
      window.removeEventListener('open-create-collection', handleOpenCollectionModal as EventListener);
      window.removeEventListener('open-template-modal', handleOpenCollectionModal as EventListener);
      window.removeEventListener('open-create-project', handleOpenCreateProject);
    };
  }, []);

  // Navigation items: Projects, Collections, Categories visually distinct
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', iconName: 'apps' },
    { to: '/library', label: 'All Resources', iconName: 'layers' },
    { to: '/projects', label: 'Projects', iconName: 'folder-open' },
    { to: '/collections', label: 'Collections', iconName: 'boxes' },
    { to: '/categories', label: 'Categories', iconName: 'bookmark' },
    { to: '/favourites', label: 'Favorites', iconName: 'star' },
  ];

  const handleLogout = async () => {
    setIsAccountMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex bg-[#262624] text-[#FAF9F5] font-sans selection:bg-[#D97757] selection:text-white overflow-x-hidden">
      {/* Mobile Drawer Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/70 backdrop-blur-xs transition-opacity duration-200 md:hidden',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* ==================== LEFT SIDEBAR ==================== */}
      <aside
        className={cn(
          'border-r border-[#3E3E38] bg-[#1C1C1B] transition-transform duration-200 ease-out select-none shrink-0 flex flex-col justify-between',
          // Mobile: fixed slide-over drawer; Desktop: natural relative column that flows with the layout
          'fixed inset-y-0 left-0 z-40 md:relative md:inset-auto md:z-auto md:min-h-screen md:h-auto w-64 max-w-[85vw] md:max-w-none md:transition-all',
          isCollapsed ? 'md:w-16' : 'md:w-56',
          isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* 1. TOP — BRAND */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#3E3E38] shrink-0 bg-[#1C1C1B]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-1 py-1 rounded-md select-none truncate"
                  title="Shelfspace Dashboard"
                >
                  <ShelfspaceLogoIcon size={18} />
                  <span className="text-xs font-semibold text-[#FAF9F5] tracking-tight truncate">
                    Shelfspace
                  </span>
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors"
                    title="Collapse sidebar"
                  >
                    <Flaticon name="angle-small-left" className="text-sm" />
                  </button>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden text-neutral-400 hover:text-white p-1 cursor-pointer"
                  >
                    <Flaticon name="cross" className="text-xs" />
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
                  <Flaticon name="angle-small-right" className="text-sm" />
                </button>
              </div>
            )}
          </div>

          {/* 2. MIDDLE — NAVIGATION (With Expandable Categories) */}
          <div className="px-2 py-3 space-y-1 flex-1">
              {navItems.map((item) => {
                // Projects Item with Quick Create Action
                if (item.to === '/projects' && !isCollapsed) {
                  return (
                    <div key={item.to} className="group relative flex items-center">
                      <NavLink
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-150 flex-1 min-w-0 pr-8',
                            isActive
                              ? 'bg-white/[0.08] text-white border-l-2 border-[#D97757] pl-2 shadow-xs'
                              : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                          )
                        }
                      >
                        <Flaticon name={item.iconName} className="text-sm shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsCreateProjectOpen(true);
                        }}
                        className="absolute right-1.5 p-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-opacity cursor-pointer opacity-70 hover:opacity-100"
                        title="Create New Project"
                        aria-label="Create New Project"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Collections Item with Quick Create Action
                if (item.to === '/collections' && !isCollapsed) {
                  return (
                    <div key={item.to} className="group relative flex items-center">
                      <NavLink
                        to={item.to}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-150 flex-1 min-w-0 pr-8',
                            isActive
                              ? 'bg-white/[0.08] text-white border-l-2 border-[#D97757] pl-2 shadow-xs'
                              : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                          )
                        }
                      >
                        <Flaticon name={item.iconName} className="text-sm shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCollectionModalTab('premade');
                          setCollectionModalType('collection');
                          setIsCollectionModalOpen(true);
                        }}
                        className="absolute right-1.5 p-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-opacity cursor-pointer opacity-70 hover:opacity-100"
                        title="New Collection"
                        aria-label="New Collection"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                // Expandable Categories Navigation Item with Quick Add and Template Actions
                if (item.to === '/categories' && !isCollapsed) {
                  const isCatSectionActive = location.pathname.startsWith('/categories');
                  return (
                    <div key={item.to} className="space-y-0.5">
                      <div
                        className={cn(
                          'group flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors duration-150',
                          isCatSectionActive
                            ? 'bg-white/[0.08] text-white border-l-2 border-[#D97757] pl-2 shadow-xs'
                            : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                        )}
                      >
                        <NavLink
                          to={item.to}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 flex-1 min-w-0"
                        >
                          <Flaticon name="bookmark" className="text-sm shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </NavLink>

                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCollectionModalTab('premade');
                              setCollectionModalType('category');
                              setIsCollectionModalOpen(true);
                            }}
                            className="p-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="New Category"
                            aria-label="New Category"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsCategoriesExpanded(!isCategoriesExpanded);
                            }}
                            className="p-1 -mr-1 rounded hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title={isCategoriesExpanded ? 'Collapse categories' : 'Expand categories'}
                            aria-label={isCategoriesExpanded ? 'Collapse categories' : 'Expand categories'}
                          >
                            <ChevronDown
                              className={cn(
                                'w-3.5 h-3.5 transition-transform duration-150',
                                !isCategoriesExpanded && '-rotate-90'
                              )}
                            />
                          </button>
                        </div>
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
                                    ? 'bg-white/[0.08] text-white font-medium border-l border-[#D97757]'
                                    : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white'
                                )}
                                title={cat.name}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                    style={{ backgroundColor: cat.color || '#D97757' }}
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
                            <div className="px-2 py-1.5 text-[11px] text-neutral-500 italic">
                              No collections yet
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
                          ? 'bg-white/[0.08] text-white border-l-2 border-[#D97757] pl-2 shadow-xs'
                          : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white',
                        isCollapsed && 'justify-center px-0 border-l-0'
                      )
                    }
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Flaticon name={item.iconName} className="text-sm shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* 3. BOTTOM — ACCOUNT (With Refined Divider & Compact Dropdown) */}
          <div className="p-2 border-t border-[#3E3E38] bg-[#1C1C1B] relative" ref={accountMenuRef}>
            {/* Account Popover Menu */}
            {isAccountMenuOpen && (
              <div
                className={cn(
                  'absolute bottom-full mb-2 rounded-md bg-[#1C1C1B] border border-[#3E3E38] shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150',
                  isCollapsed ? 'left-2 w-48' : 'inset-x-2'
                )}
              >
                <div className="px-3 py-2 border-b border-[#3E3E38] text-xs">
                  <p className="font-medium text-[#FAF9F5] truncate">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Flaticon name="user" className="text-xs text-neutral-400" />
                  <span>Profile</span>
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <Flaticon name="settings" className="text-xs text-neutral-400" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-[#3E3E38] my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                >
                  <Flaticon name="sign-out-alt" className="text-xs" />
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
                  <div className="w-7 h-7 rounded-full bg-[#1B1B19] border border-[#3E3E38] text-white font-medium flex items-center justify-center text-xs shrink-0 font-mono">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-medium text-[#FAF9F5] truncate block leading-tight group-hover:text-white">
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
                <div className="w-6 h-6 rounded-full bg-[#1B1B19] border border-[#3E3E38] text-white font-medium flex items-center justify-center text-xs shrink-0 font-mono">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
            )}
          </div>
      </aside>

      {/* ==================== MAIN VIEW AREA ==================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#262624]">
        {/* Top Header: Compact Global Search & Mobile Brand */}
        <header className="h-14 border-b border-[#3E3E38] bg-[#262624]/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-neutral-400 hover:text-white p-1.5 -ml-1 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Flaticon name="menu-burger" className="text-sm" />
            </button>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 md:hidden select-none"
              title="Shelfspace Dashboard"
            >
              <ShelfspaceLogoIcon size={16} />
              <span className="text-xs font-semibold text-[#FAF9F5] tracking-tight">
                Shelfspace
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Compact Global Search */}
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 h-8 px-2.5 sm:px-3 rounded-md bg-[#1C1C1B] border border-[#3E3E38] text-xs text-neutral-400 hover:border-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <Flaticon name="search" className="text-xs text-neutral-400" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-neutral-500 border border-[#3E3E38]">
                ⌘K
              </kbd>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
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

      {/* Create Collection / Category Modal (Pre-made 1-click & Custom) */}
      <CreateCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => setIsCollectionModalOpen(false)}
        initialTab={collectionModalTab}
        type={collectionModalType}
        onSuccess={() => {
          fetchCategories();
        }}
      />

      {/* Quick Create Project Modal from Sidebar */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
