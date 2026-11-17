import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Bookmark, 
  Search, 
  Layers, 
  FolderKanban, 
  Pin, 
  Zap, 
  Command, 
  Link2, 
  ExternalLink,
  BookOpen,
  Keyboard,
  Compass,
  ArrowRight,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SplitText } from '../ui/SplitText';

export const OssiumNavbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const [platformOpen, setPlatformOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const platformRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) {
        setPlatformOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
      scrolled 
        ? 'bg-[#000]/90 backdrop-blur-md border-b border-white/[0.07] shadow-lg shadow-black/40' 
        : 'bg-[#000]/70 backdrop-blur-sm border-b border-white/[0.05]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group select-none py-1"
        >
          <div className="w-7 h-7 rounded-none bg-neutral-800 border border-white/10 flex items-center justify-center group-hover:border-[#09AE5B]/50 transition-colors">
            <span className="w-2.5 h-2.5 rounded-none bg-[#09AE5B]"></span>
          </div>
          <span className="text-lg font-bold tracking-tight text-[#E5E5E5] group-hover:text-white transition-colors">
            <SplitText hoverColor="text-white">shelfspace</SplitText>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Platform Megamenu Dropdown */}
          <div className="relative" ref={platformRef}>
            <button
              onClick={() => {
                setPlatformOpen(!platformOpen);
                setResourcesOpen(false);
              }}
              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-none transition-colors ${
                platformOpen 
                  ? 'text-white bg-white/[0.06]' 
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <SplitText hoverColor="text-white">Platform</SplitText>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${platformOpen ? 'rotate-180 text-[#09AE5B]' : 'text-neutral-400 group-hover:text-white'}`} />
            </button>

            {platformOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[720px] max-w-[90vw] animate-fade-in">
                <div className="relative bg-[#121316] border border-white/[0.09] rounded-none p-5 shadow-2xl backdrop-blur-xl">
                  {/* Subtle crosshair corner accents */}
                  <span className="absolute -top-1.5 -left-1.5 text-neutral-600 font-mono text-xs select-none">+</span>
                  <span className="absolute -top-1.5 -right-1.5 text-neutral-600 font-mono text-xs select-none">+</span>
                  <span className="absolute -bottom-1.5 -left-1.5 text-neutral-600 font-mono text-xs select-none">+</span>
                  <span className="absolute -bottom-1.5 -right-1.5 text-neutral-600 font-mono text-xs select-none">+</span>

                  <div className="grid grid-cols-3 gap-6 divide-x divide-white/[0.06]">
                    {/* Column 1: Discover & Index */}
                    <div className="space-y-3">
                      <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase pl-2">
                        Discover & Index
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/library"
                          onClick={() => setPlatformOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Bookmark className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Central Library</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Every bookmark & asset in unified grid</div>
                          </div>
                        </Link>

                        <Link
                          to="/library"
                          onClick={() => setPlatformOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Search className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Sub-20ms Search</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Instant fuzzy full-text lookup</div>
                          </div>
                        </Link>

                        <Link
                          to="/library"
                          onClick={() => setPlatformOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Taxonomy & Tags</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Multi-dimensional tech tagging</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Column 2: Curation & Workspaces */}
                    <div className="space-y-3 pl-6">
                      <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase pl-2">
                        Organization
                      </div>
                      <div className="space-y-1">
                        <Link
                          to="/collections"
                          onClick={() => setPlatformOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Collections</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Curated groupings and stacks</div>
                          </div>
                        </Link>

                        <Link
                          to="/projects"
                          onClick={() => setPlatformOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Compass className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Projects</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Per-project resource binders</div>
                          </div>
                        </Link>

                        <Link
                          to="/favourites"
                          onClick={() => setPlatformOpen(false)}
                          className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group"
                        >
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Pin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Pinned Favorites</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Single-click high-frequency links</div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Column 3: Workflow Tools */}
                    <div className="space-y-3 pl-6">
                      <div className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase pl-2">
                        Productivity
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group cursor-pointer" onClick={() => { setPlatformOpen(false); navigate('/dashboard'); }}>
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Quick Add Bar</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Instant paste & auto metadata</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group cursor-pointer" onClick={() => { setPlatformOpen(false); navigate('/dashboard'); }}>
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Command className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Command Palette</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Keyboard driven ⌘K actions</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2 rounded-none hover:bg-white/[0.04] transition-colors group cursor-pointer" onClick={() => { setPlatformOpen(false); navigate('/settings'); }}>
                          <div className="p-1.5 rounded-none bg-white/[0.05] text-neutral-300 group-hover:text-[#09AE5B] group-hover:bg-[#09AE5B]/10 transition-colors">
                            <Link2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#E5E5E5] group-hover:text-white">Live Health Check</div>
                            <div className="text-xs text-neutral-400 line-clamp-1">Dead links detector & status</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Megamenu Bottom Bar */}
                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#09AE5B]" />
                      Organize libraries, docs, packages, components & bookmarks in one place
                    </span>
                    <Link 
                      to={isAuthenticated ? "/dashboard" : "/register"} 
                      onClick={() => setPlatformOpen(false)}
                      className="text-[#09AE5B] hover:text-[#07914b] font-medium flex items-center gap-1 group"
                    >
                      Open Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative" ref={resourcesRef}>
            <button
              onClick={() => {
                setResourcesOpen(!resourcesOpen);
                setPlatformOpen(false);
              }}
              className={`group inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-none transition-colors ${
                resourcesOpen 
                  ? 'text-white bg-white/[0.06]' 
                  : 'text-neutral-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <SplitText hoverColor="text-white">Resources</SplitText>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${resourcesOpen ? 'rotate-180 text-[#09AE5B]' : 'text-neutral-400 group-hover:text-white'}`} />
            </button>

            {resourcesOpen && (
              <div className="absolute top-full left-0 pt-3 w-64 animate-fade-in">
                <div className="relative bg-[#121316] border border-white/[0.09] rounded-none p-2.5 shadow-2xl backdrop-blur-xl space-y-1">
                  <a
                    href="#features"
                    onClick={() => setResourcesOpen(false)}
                    className="group flex items-center gap-2.5 p-2 rounded-none text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <BookOpen className="w-4 h-4 text-[#09AE5B]" />
                    <SplitText hoverColor="text-white">Documentation & Guides</SplitText>
                  </a>
                  <a
                    href="#faq"
                    onClick={() => setResourcesOpen(false)}
                    className="group flex items-center gap-2.5 p-2 rounded-none text-sm text-neutral-300 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <Keyboard className="w-4 h-4 text-[#09AE5B]" />
                    <SplitText hoverColor="text-white">Frequently Asked Questions</SplitText>
                  </a>
                  <div className="pt-1.5 mt-1.5 border-t border-white/[0.06]">
                    <div className="px-2 py-1 text-[11px] text-neutral-500 font-mono">
                      v2.4.0 • Ossium Architecture
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <a 
            href="#features" 
            className="group px-3 py-1.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.04] rounded-none transition-colors inline-flex items-center"
          >
            <SplitText hoverColor="text-white">Features</SplitText>
          </a>
          <a 
            href="#faq" 
            className="group px-3 py-1.5 text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.04] rounded-none transition-colors inline-flex items-center"
          >
            <SplitText hoverColor="text-white">FAQ</SplitText>
          </a>
        </nav>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-none text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-none bg-[#E5E5E5] pl-4 pr-2 py-1 text-xs sm:text-sm font-semibold text-black hover:bg-white transition-colors duration-200 shadow-sm"
              >
                <SplitText hoverColor="text-black">Dashboard</SplitText>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-none bg-black text-[#E5E5E5] text-[10px]">
                  ↗
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                to="/login"
                className="group inline-flex items-center justify-center px-3.5 sm:px-4 py-1 h-[30px] rounded-md bg-[#EDEDED] hover:bg-white text-[#0E0F10] text-xs sm:text-sm font-medium border border-white/40 hover:border-white shadow-[0_1px_2px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.7)] transition-all duration-150 active:scale-[0.99]"
              >
                <SplitText hoverColor="text-[#0E0F10]">Login Now</SplitText>
              </Link>
              <Link
                to="/register"
                className="group hidden sm:inline-flex items-center gap-1.5 rounded-md bg-[#18191d] hover:bg-[#202127] px-4 py-1.5 h-[30px] text-xs sm:text-sm font-medium text-[#EDEDED] hover:text-white border border-white/[0.12] hover:border-white/[0.22] shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-[0.99]"
              >
                <SplitText hoverColor="text-white">Sign Up</SplitText>
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-none text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0E0F10] border-b border-white/[0.08] px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-none text-sm font-medium text-neutral-200 hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#09AE5B]">Library</SplitText>
            </Link>
            <Link
              to="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-none text-sm font-medium text-neutral-200 hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#09AE5B]">Collections</SplitText>
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-none text-sm font-medium text-neutral-200 hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#09AE5B]">Features</SplitText>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-none text-sm font-medium text-neutral-200 hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#09AE5B]">FAQ</SplitText>
            </a>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 rounded-md bg-[#EDEDED] hover:bg-white text-[#0E0F10] font-medium text-sm border border-white/40 shadow-xs"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-md bg-[#EDEDED] hover:bg-white text-[#0E0F10] font-medium text-sm border border-white/40 shadow-xs"
                >
                  Login Now
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-md bg-[#18191d] hover:bg-[#202127] text-[#EDEDED] hover:text-white font-medium text-sm border border-white/[0.12]"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
