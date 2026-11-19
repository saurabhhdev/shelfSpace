import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flaticon } from '../ui/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { SplitText } from '../ui/SplitText';
import { ShelfspaceLogoIcon } from '../ui/ShelfspaceLogo';
import { InteractiveHoverButton } from '../ui/InteractiveHoverButton';
import { VscGithubAlt } from 'react-icons/vsc';

export const OssiumNavbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'bg-[#262624]/90 backdrop-blur-md border-b border-[#3E3E38] shadow-lg shadow-black/40'
          : 'bg-[#262624]/75 backdrop-blur-sm border-b border-[#3E3E38]/70'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo (Concept #6: Books on Shelf - Fixed without hover effects) */}
        <Link to="/" className="flex items-center gap-2.5 select-none py-1" title="Shelfspace">
          <ShelfspaceLogoIcon size={24} />
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#FAF9F5]">
            Shelfspace
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

          {/* Features Anchor */}
          <a
            href="#features"
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#B7B5A9] hover:text-[#FAF9F5] hover:bg-white/[0.04] rounded-md transition-colors inline-flex items-center"
          >
            <SplitText hoverColor="text-white">Features</SplitText>
          </a>

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

        {/* Right CTA Cluster — Login/Signup (21st.dev Interactive Hover Button) */}
        <div className="flex items-center gap-2.5">
          {!isAuthenticated ? (
            <InteractiveHoverButton
              to="/login"
              text="Login / Signup"
              className="h-8 px-3.5 text-xs font-semibold"
            />
          ) : (
            <InteractiveHoverButton
              to="/dashboard"
              text="Dashboard"
              className="h-8 px-4 text-xs font-semibold"
            />
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
              <InteractiveHoverButton
                to="/login"
                text="Login / Signup"
                className="w-full h-10 text-sm font-semibold justify-center"
                onClick={() => setMobileMenuOpen(false)}
              />
            ) : (
              <InteractiveHoverButton
                to="/dashboard"
                text="Dashboard"
                className="w-full h-10 text-sm font-semibold justify-center"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default OssiumNavbar;
