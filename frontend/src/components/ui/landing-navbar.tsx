import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FlipLink } from './flip-link';
import {
  Navbar,
  NavBody,
  NavbarLogo,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from './resizable-navbar';
import {
  Moon,
  Sun,
  Laptop,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const LandingNavbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('dark');
    else if (theme === 'dark') setTheme('light');
    else setTheme('system');
  };

  const navItems = [
    {
      name: 'home',
      link: '#',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setMobileMenuOpen(false);
      },
    },
    {
      name: 'explore',
      link: isAuthenticated ? '/library' : '#explore',
      onClick: () => {
        if (!isAuthenticated) {
          const el = document.getElementById('explore');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
          navigate('/library');
        }
        setMobileMenuOpen(false);
      },
    },
    {
      name: 'about',
      link: '#about',
      onClick: () => {
        const el = document.getElementById('about');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
      },
    },
  ];

  return (
    <Navbar>
      <NavBody>
        <NavbarLogo href="/" />

        {/* Right cluster: Navigation links, Auth actions, Theme toggle, Dotted separator, Cross-hatch block */}
        <div className="flex items-center gap-4 sm:gap-6">
          <NavItems items={navItems} />

          {/* Authentication items: Login & Sign up or Profile Menu */}
          {isAuthenticated ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 py-1 pl-1 pr-2.5 rounded-none border border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] bg-[#0c0c12]/80 dark:bg-[#0c0c12]/80 light:bg-white/80 hover:border-[#10b981] transition-all cursor-pointer select-none"
                aria-expanded={profileMenuOpen}
                aria-label="User account menu"
              >
                <div className="w-5 h-5 rounded-none bg-[#10b981] text-black font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-xs font-medium text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] max-w-[80px] truncate hidden sm:inline">
                  {user?.name ? user.name.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown
                  className={cn(
                    'w-3 h-3 text-[#a1a1aa] transition-transform duration-200',
                    profileMenuOpen && 'rotate-180'
                  )}
                />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-none bg-[#0a0a10] dark:bg-[#0a0a10] light:bg-white border border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] py-1 z-50 shadow-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1]">
                    <div className="text-xs font-semibold text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] truncate">
                      {user?.name || 'Developer'}
                    </div>
                    <div className="text-[10px] text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] font-mono truncate">
                      {user?.email || 'Logged in'}
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] hover:text-[#10b981] hover:bg-[#14141e] dark:hover:bg-[#14141e] light:hover:bg-[#f1f3f6] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/library"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] hover:text-[#10b981] hover:bg-[#14141e] dark:hover:bg-[#14141e] light:hover:bg-[#f1f3f6] transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>All Resources</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] hover:text-[#10b981] hover:bg-[#14141e] dark:hover:bg-[#14141e] light:hover:bg-[#f1f3f6] transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>Settings</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1]">
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileMenuOpen(false);
                        await logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-[13px] font-normal lowercase tracking-tight">
              <Link to="/login" className="py-1">
                <FlipLink>login</FlipLink>
              </Link>
              <Link to="/register" className="py-1">
                <FlipLink>sign up</FlipLink>
              </Link>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={cycleTheme}
            className="w-8 h-8 rounded-none border border-[#2e2e40] dark:border-[#2e2e40] light:border-[#d4d4dc] bg-transparent hover:bg-[#111118] dark:hover:bg-[#111118] light:hover:bg-[#f1f3f6] hover:border-[#10b981] dark:hover:border-[#10b981] light:hover:border-[#059669] flex items-center justify-center text-[#f4f4f7] dark:text-[#f4f4f7] light:text-[#09090b] hover:text-[#10b981] dark:hover:text-[#10b981] light:hover:text-[#059669] transition-all cursor-pointer select-none"
            title={`Current theme: ${theme} (Click to toggle)`}
            aria-label="Toggle color theme"
          >
            {theme === 'system' ? (
              <Laptop className="w-3.5 h-3.5 text-[#10b981] dark:text-[#10b981] light:text-[#059669]" strokeWidth={1.8} />
            ) : resolvedTheme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-[#f4f4f7]" strokeWidth={1.8} />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.8} />
            )}
          </button>

          {/* Vertical dotted line separator & Cross-hatch wireframe block at right edge */}
          <div className="flex items-center">
            <div className="h-6 border-l border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1]" />
            <div
              className="h-6 w-10 px-1 flex items-center justify-center border-r border-dotted border-[#2e2e40] dark:border-[#2e2e40] light:border-[#cbd5e1] overflow-hidden select-none"
              aria-hidden="true"
            >
              <svg className="w-full h-full text-[#38384e] dark:text-[#38384e] light:text-[#cbd5e1]" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="nav-crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M0 0L8 8M8 0L0 8" stroke="currentColor" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#nav-crosshatch)" />
              </svg>
            </div>
          </div>
        </div>
      </NavBody>

      {/* Mobile Navigation Drawer */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo href="/" title="shelfspace." />
          <div className="flex items-center gap-2">
            <button
              onClick={cycleTheme}
              className="w-7.5 h-7.5 rounded-none border border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] bg-transparent flex items-center justify-center text-[#a1a1aa] hover:text-[#10b981] transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </button>
            <MobileNavToggle
              isOpen={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.link}
              onClick={(e) => {
                e.preventDefault();
                item.onClick();
              }}
              className="py-1 text-xs text-[#a1a1aa] dark:text-[#a1a1aa] light:text-[#64748b] hover:text-[#10b981] transition-colors"
            >
              {item.name}
            </a>
          ))}
          <div className="pt-2 border-t border-dotted border-[#242432] dark:border-[#242432] light:border-[#d4d4dc] flex gap-2">
            {isAuthenticated ? (
              <div className="w-full flex gap-2">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-1.5 px-3 text-center text-xs font-mono bg-[#10b981] text-black font-semibold"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="flex-1 py-1.5 px-3 text-center text-xs font-mono border border-rose-900 text-rose-400"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="w-full flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-1.5 px-3 text-center text-xs font-mono border border-[#242432] text-[#f4f4f7]"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-1.5 px-3 text-center text-xs font-mono bg-[#10b981] text-black font-semibold"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};

export default LandingNavbar;
