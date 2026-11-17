import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  BookmarkCheck,
  Star,
  Settings,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  User,
  ChevronDown,
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
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

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'All Resources', icon: Layers },
    { to: '/categories', label: 'Categories', icon: BookmarkCheck },
    { to: '/favourites', label: 'Favorites', icon: Star },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex bg-[#0E0F10] text-[#E5E5E5] font-sans selection:bg-[#09AE5B] selection:text-black">
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (Desktop collapsible & Mobile drawer) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-white/[0.08] bg-[#0E0F10] transition-all duration-150 ease-in-out md:sticky md:top-0 md:h-screen select-none shrink-0',
          isCollapsed ? 'w-16' : 'w-56',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* 1. Top Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-white/[0.08] shrink-0 bg-[#0E0F10]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2.5 px-1 py-1 rounded-md hover:bg-white/[0.04] transition-colors truncate"
                >
                  <div className="w-5 h-5 rounded-md bg-neutral-800 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[#09AE5B]"></span>
                  </div>
                  <span className="text-xs font-semibold text-[#E5E5E5] tracking-tight truncate">
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

          {/* 2. Middle Navigation (5 core items) */}
          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-white/[0.08] text-white'
                        : 'text-neutral-400 hover:bg-white/[0.04] hover:text-white',
                      isCollapsed && 'justify-center px-0'
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

          {/* 3. Bottom Profile & Account Actions */}
          <div className="p-2 border-t border-white/[0.08] shrink-0 bg-[#0E0F10]">
            {!isCollapsed ? (
              <div className="flex items-center justify-between p-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
                <Link to="/settings" className="flex items-center gap-2 truncate min-w-0 flex-1 pr-1">
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
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-neutral-400 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.06] cursor-pointer transition-colors shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-white/[0.06] cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0E0F10]">
        {/* TOP NAVIGATION: Compact Global Search & Profile Menu */}
        <header className="h-14 border-b border-white/[0.08] bg-[#0E0F10] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
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

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-md hover:bg-white/[0.05] transition-colors cursor-pointer text-xs"
              >
                <div className="w-6 h-6 rounded-full bg-neutral-800 border border-white/10 text-white font-semibold flex items-center justify-center text-xs shrink-0 font-mono">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline font-medium text-[#E5E5E5] text-xs truncate max-w-[120px]">
                  {user?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {/* Dropdown containing Profile, Settings, Logout */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-md bg-[#121316] border border-white/[0.08] shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-white/[0.06] text-xs">
                    <p className="font-medium text-[#EDEDED] truncate">{user?.name || 'User'}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-white/[0.06] my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
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
