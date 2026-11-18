import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flaticon } from '../ui/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { SplitText } from '../ui/SplitText';
import { VscGithubAlt } from 'react-icons/vsc';
import { FiUser } from 'react-icons/fi';

export const OssiumNavbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const featuresRef = useRef<HTMLDivElement>(null);

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
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const features = [
    {
      title: 'Resource Collection',
      description: 'Bookmark repos, UI components, snippets, and tools.',
      iconName: 'boxes',
    },
    {
      title: 'Project Organization',
      description: 'Attach libraries and references to specific builds.',
      iconName: 'folder-open',
    },
    {
      title: 'Smart Auto Add',
      description: 'Auto-fetch title, description, and preview image from URL.',
      iconName: 'sparkles',
    },
    {
      title: 'Auto Categorization & Tags',
      description: 'Get relevant tag and category suggestions instantly.',
      iconName: 'tags',
    },
    {
      title: 'Quick Search & Filters',
      description: 'Find items by keyword, type, tags, and custom categories.',
      iconName: 'settings-sliders',
    },
    {
      title: 'Favorites',
      description: 'Pin high-frequency utilities and docs at the top.',
      iconName: 'star',
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-[#262624]/90 backdrop-blur-md border-b border-[#3E3E38] shadow-lg shadow-black/40'
          : 'bg-[#262624]/75 backdrop-blur-sm border-b border-[#3E3E38]/70'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group select-none py-1">
          <div className="w-7 h-7 rounded-md bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center group-hover:border-[#D97757]/60 transition-colors">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D97757]" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#FAF9F5] group-hover:text-white transition-colors">
            <SplitText hoverColor="text-white">shelfspace</SplitText>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* What You Can Do Anchor */}
          <a
            href="#what-you-can-do"
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#B7B5A9] hover:text-[#FAF9F5] hover:bg-white/[0.04] rounded-md transition-colors inline-flex items-center"
          >
            <SplitText hoverColor="text-white">What You Can Do</SplitText>
          </a>

          {/* Features Dropdown + Anchor */}
          <div className="relative" ref={featuresRef}>
            <div className="flex items-center">
              <a
                href="#features"
                className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#B7B5A9] hover:text-[#FAF9F5] hover:bg-white/[0.04] rounded-l-md transition-colors inline-flex items-center"
              >
                <SplitText hoverColor="text-white">Features</SplitText>
              </a>
              <button
                type="button"
                onClick={() => setFeaturesOpen(!featuresOpen)}
                aria-label="Toggle Features Menu"
                className="px-1.5 py-2 text-xs sm:text-sm font-medium text-[#B7B5A9] hover:text-[#FAF9F5] hover:bg-white/[0.04] rounded-r-md transition-colors cursor-pointer"
              >
                <Flaticon
                  name="angle-small-down"
                  className={`text-[10px] transition-transform duration-200 ${
                    featuresOpen ? 'rotate-180 text-[#D97757]' : 'text-neutral-400'
                  }`}
                />
              </button>
            </div>

            {featuresOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 w-[540px] max-w-[90vw] animate-fade-in">
                <div className="bg-[#1C1C1B] border border-[#3E3E38] rounded-lg p-3 shadow-2xl backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-1.5">
                    {features.map((feature) => (
                      <a
                        key={feature.title}
                        href="#features"
                        onClick={() => setFeaturesOpen(false)}
                        className="flex items-start gap-2.5 p-2.5 rounded-md hover:bg-white/[0.04] transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-md bg-[#262624] border border-[#3E3E38] flex items-center justify-center text-[#D97757] group-hover:border-[#52514A] shrink-0 mt-0.5">
                          <Flaticon name={feature.iconName} className="text-xs" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#FAF9F5] group-hover:text-white">
                            {feature.title}
                          </div>
                          <div className="text-[11px] text-[#B7B5A9] line-clamp-1 mt-0.5">
                            {feature.description}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  <div className="mt-2 pt-2.5 border-t border-[#3E3E38] flex items-center justify-between text-xs px-1 text-[#B7B5A9]">
                    <span className="text-[11px]">6 core tools built to keep you organized</span>
                    <a
                      href="#features"
                      onClick={() => setFeaturesOpen(false)}
                      className="text-[11px] text-[#D97757] hover:text-[#EE8360] font-medium flex items-center gap-1 group"
                    >
                      View all features
                      <Flaticon
                        name="angle-small-right"
                        className="text-xs group-hover:translate-x-0.5 transition-transform"
                      />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FAQ Anchor */}
          <a
            href="#faq"
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#B7B5A9] hover:text-[#FAF9F5] hover:bg-white/[0.04] rounded-md transition-colors inline-flex items-center"
          >
            <SplitText hoverColor="text-white">FAQ</SplitText>
          </a>

          {/* Star on GitHub in Center Navigation */}
          <a
            href="https://github.com/saurabhhdev/shelfSpace"
            target="_blank"
            rel="noreferrer noopener"
            className="group inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#1C1C1B] hover:bg-[#262624] text-xs font-medium text-[#FAF9F5] border border-[#3E3E38] hover:border-[#525149] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.35)] transition-all duration-150 active:scale-[0.98]"
            title="Star Shelfspace on GitHub"
          >
            <VscGithubAlt className="text-[13px] text-[#B7B5A9] group-hover:text-white transition-colors shrink-0" />
            <span>Star on GitHub</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/[0.08] text-amber-500 text-[10px] font-mono group-hover:scale-110 transition-transform">
              ★
            </span>
          </a>
        </nav>

        {/* Right CTA Cluster — Login/Signup */}
        <div className="flex items-center gap-2.5">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="group inline-flex items-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all duration-150 active:scale-[0.98] active:translate-y-[0.5px]"
              title="Log in or create an account"
            >
              <FiUser className="text-[13px] text-[#141413] shrink-0" />
              <span className="flex items-center gap-1 font-semibold">
                <span>Login</span>
                <span className="text-[#141413]/40 font-mono text-[10px]">/</span>
                <span>Signup</span>
              </span>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#141413] text-[10px] font-mono">
                ↗
              </span>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-4 py-1.5 text-xs sm:text-sm font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all duration-150 active:scale-[0.98] active:translate-y-[0.5px]"
            >
              <span>Dashboard</span>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#141413] text-[10px] font-mono">
                ↗
              </span>
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md text-neutral-300 hover:text-white hover:bg-white/[0.06]"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? (
              <Flaticon name="cross" className="text-xs" />
            ) : (
              <Flaticon name="menu-burger" className="text-sm" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#262624] border-b border-[#3E3E38] px-4 pt-3 pb-6 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <a
              href="#what-you-can-do"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-md text-sm font-medium text-[#FAF9F5] hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#D97757]">What You Can Do</SplitText>
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-md text-sm font-medium text-[#FAF9F5] hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#D97757]">Features</SplitText>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="group block px-3 py-2 rounded-md text-sm font-medium text-[#FAF9F5] hover:bg-white/[0.06]"
            >
              <SplitText hoverColor="text-[#D97757]">FAQ</SplitText>
            </a>
            <a
              href="https://github.com/saurabhhdev/shelfSpace"
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center justify-between px-3.5 py-2.5 rounded-md bg-[#1C1C1B] hover:bg-[#262624] text-sm font-medium text-[#FAF9F5] border border-[#3E3E38] hover:border-[#525149] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.3)] transition-all"
            >
              <div className="flex items-center gap-2">
                <VscGithubAlt className="text-base text-[#B7B5A9] group-hover:text-white transition-colors" />
                <span>Star on GitHub</span>
              </div>
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-white/[0.08] text-amber-500 text-xs font-mono">
                ★
              </span>
            </a>
          </div>

          <div className="pt-3 border-t border-[#3E3E38] flex flex-col gap-2">
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] text-[#141413] font-medium text-sm border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all"
              >
                <FiUser className="text-sm" />
                <span className="font-semibold">Login / Signup</span>
                <span className="text-xs font-mono">↗</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] text-[#141413] font-medium text-sm border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all"
              >
                <span>Dashboard</span>
                <span className="text-xs font-mono">↗</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default OssiumNavbar;
