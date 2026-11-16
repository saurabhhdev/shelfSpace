import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import {
  ArrowRight,
  ChevronRight,
  Code2,
  Layout,
  Palette,
  Database,
  BookOpen,
  FileText,
  Search,
  Sparkles,
  Command,
  Star,
  Check,
  Moon,
  Sun,
  Menu,
  X,
  ExternalLink,
  GitFork,
  Copy,
  Layers,
  BookmarkCheck,
  FolderKanban,
  Zap,
  ShieldCheck,
  Link2,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'ui' | 'design' | 'dev'>('all');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfa] dark:bg-[#0d0d0f] text-[#2b2a28] dark:text-[#f4f4f5] transition-colors duration-150 selection:bg-emerald-500/20">
      {/* 1. STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#fbfbfa]/90 dark:bg-[#0d0d0f]/90 backdrop-blur-md border-b border-[#ececeb] dark:border-[#222227]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#191919] dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
              S
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
              Shelfspace
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#787774] dark:text-[#a1a1aa]">
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-[#2b2a28] dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('categories')}
              className="hover:text-[#2b2a28] dark:hover:text-white transition-colors cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-[#2b2a28] dark:hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollTo('why-shelfspace')}
              className="hover:text-[#2b2a28] dark:hover:text-white transition-colors cursor-pointer"
            >
              Philosophy
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white hover:bg-[#f2f2ef] dark:hover:bg-[#1c1c22] transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" pill size="sm" className="text-xs h-8 px-4 font-medium shadow-xs">
                  Open Workspace
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" pill size="sm" className="text-xs h-8 px-4 font-medium shadow-xs">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-[#8e8d8a]"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#5f5e5b] dark:text-[#a1a1aa]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4 border-b border-[#ececeb] dark:border-[#222227] bg-[#fbfbfa] dark:bg-[#0d0d0f] space-y-3 text-xs">
            <button
              onClick={() => scrollTo('features')}
              className="block w-full text-left py-1 text-[#5f5e5b] dark:text-[#a1a1aa]"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('categories')}
              className="block w-full text-left py-1 text-[#5f5e5b] dark:text-[#a1a1aa]"
            >
              Categories
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="block w-full text-left py-1 text-[#5f5e5b] dark:text-[#a1a1aa]"
            >
              How It Works
            </button>
            <div className="pt-2 border-t border-[#ececeb] dark:border-[#222227] flex gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="w-full">
                  <Button variant="primary" pill size="sm" className="w-full text-xs">
                    Open Workspace
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" className="flex-1">
                    <Button variant="primary" pill size="sm" className="w-full text-xs">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION (21st.dev Hero-1 Theme + Serendale / Notion) */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-36 px-4 sm:px-6 overflow-hidden bg-[linear-gradient(to_bottom,#fff,#ffffff_50%,#e8e8e8_88%)] dark:bg-[linear-gradient(to_bottom,#000,#0000_30%,#898e8e_78%,#ffffff_99%_50%)] rounded-b-3xl border-b border-[#e5e5e5] dark:border-[#222226]">
        {/* Grid Pattern Overlay with Radial Mask (21st.dev hero-1) */}
        <div
          className="absolute -z-10 inset-0 opacity-80 h-[700px] w-full bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#333_1px,transparent_1px),linear-gradient(to_bottom,#333_1px,transparent_1px)] bg-[size:6rem_5rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none"
        />

        {/* Planetary Horizon Glow Dome (21st.dev hero-1) */}
        <div
          className="absolute left-1/2 top-[calc(100%-110px)] lg:top-[calc(100%-170px)] h-[500px] w-[700px] md:h-[550px] md:w-[1100px] lg:h-[750px] lg:w-[140%] -translate-x-1/2 rounded-[100%] border-[#B48CDE] bg-white dark:bg-black bg-[radial-gradient(closest-side,#fff_82%,#000000)] dark:bg-[radial-gradient(closest-side,#000_82%,#ffffff)] animate-fade-up pointer-events-none opacity-85"
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow Badge (Capsule style from 21st.dev) */}
          <div className="inline-block group cursor-pointer animate-fade-in">
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium mx-auto px-4 py-1.5 bg-gradient-to-tr from-zinc-300/10 via-gray-400/10 to-transparent border border-gray-300/30 dark:border-white/10 rounded-full w-fit tracking-tight uppercase flex items-center justify-center gap-2 shadow-2xs hover:border-gray-400/50 dark:hover:border-white/20 transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Developer Resource Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform duration-300" />
            </span>
          </div>

          {/* Main Headline with 21st.dev Gradient Masking */}
          <h1 className="animate-fade-in text-balance bg-gradient-to-br from-black from-30% to-black/50 bg-clip-text py-2 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tighter text-transparent dark:from-white dark:to-white/40 max-w-4xl mx-auto">
            Everything useful.
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent italic font-serif font-normal">
              Never lost again.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in mb-4 text-balance text-sm sm:text-base md:text-lg tracking-tight text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The minimal, high-speed workspace to collect, organize, and recall the tools, color palettes, repositories, and inspirations behind everything you build.
          </p>

          {/* Dual Pill CTA Buttons (21st.dev + Serendale.ai) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1 z-20 relative">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                variant="primary"
                pill
                size="lg"
                className="w-full sm:w-auto px-7 h-11 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Explore Shelfspace Free
              </Button>
            </Link>
            <Button
              variant="secondary"
              pill
              size="lg"
              className="w-full sm:w-auto px-6 h-11 text-xs sm:text-sm font-medium border border-gray-300/40 dark:border-white/10 hover:border-gray-400/60 dark:hover:border-white/20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xs transition-all cursor-pointer shadow-2xs"
              onClick={() => scrollTo('live-preview')}
            >
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>See Live Interactive Preview</span>
            </Button>
          </div>

          {/* REAL INTERACTIVE PRODUCT PREVIEW CARD */}
          <div id="live-preview" className="pt-8 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] shadow-xl overflow-hidden text-left transition-all">
              {/* Window Chrome / Header */}
              <div className="px-4 py-3 border-b border-[#f1f1ef] dark:border-[#222227] bg-[#fbfbfa]/80 dark:bg-[#131316]/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5e5e3] dark:bg-[#2e2e36]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5e5e3] dark:bg-[#2e2e36]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#e5e5e3] dark:bg-[#2e2e36]" />
                  <span className="text-xs font-mono text-[#8e8d8a] dark:text-[#71717a] ml-2 hidden sm:inline">
                    shelfspace.app/library
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#f0f0ee] dark:bg-[#202026] border border-[#e5e5e3] dark:border-[#2a2a34] text-[10px] font-mono text-[#8e8d8a] dark:text-[#71717a]">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold">
                    Live Demo
                  </span>
                </div>
              </div>

              {/* Mock App Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Search Bar + Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 max-w-md h-8.5 px-3 rounded-lg bg-[#fbfbfa] dark:bg-[#131316] border border-[#ececeb] dark:border-[#26262c] text-xs text-[#8e8d8a] dark:text-[#71717a]">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search icons, design palettes, repositories...</span>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#f0f0ee] dark:bg-[#202026] text-xs">
                    {(['all', 'ui', 'design', 'dev'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer text-xs',
                          activeTab === tab
                            ? 'bg-white dark:bg-[#2a2a34] text-[#191919] dark:text-white shadow-xs font-semibold'
                            : 'text-[#8e8d8a] hover:text-[#2b2a28] dark:hover:text-white'
                        )}
                      >
                        {tab === 'all' ? 'All' : tab === 'dev' ? 'Development' : tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 Real LinkNest Previews Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Card 1: Lineicons */}
                  {(activeTab === 'all' || activeTab === 'ui') && (
                    <div className="p-3.5 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-[#fbfbfa] dark:bg-[#131316] space-y-2 hover:border-[#cfcfcc] transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 font-medium">
                          UI / Icons
                        </span>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </div>
                      <h4 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">
                        Lineicons 8,400+ Vector Icons
                      </h4>
                      <p className="text-[11px] text-[#787774] dark:text-[#a1a1aa] line-clamp-2">
                        Handcrafted line and duotone icons built for developer dashboards and modern web apps.
                      </p>
                      <div className="pt-2 border-t border-[#f1f1ef] dark:border-[#222227] flex items-center justify-between text-[10px] font-mono text-[#8e8d8a] dark:text-[#71717a]">
                        <span>lineicons.com</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#f0f0ee] dark:bg-[#202026]">#icons</span>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Palette Swatches (Interactive!) */}
                  {(activeTab === 'all' || activeTab === 'design') && (
                    <div className="p-3.5 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-[#fbfbfa] dark:bg-[#131316] space-y-2 hover:border-[#cfcfcc] transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-medium">
                          Design / Colors
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8e8d8a]" />
                      </div>
                      <h4 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">
                        Electric Emerald & Charcoal
                      </h4>
                      {/* Swatches */}
                      <div className="flex gap-1 py-1">
                        {['#0d0d0f', '#18181c', '#10b981', '#34d399', '#fbfbfa'].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => handleCopyColor(hex)}
                            title={`Click to copy ${hex}`}
                            className="flex-1 h-5.5 rounded border border-black/10 dark:border-white/10 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer shadow-2xs"
                            style={{ backgroundColor: hex }}
                          >
                            {copiedHex === hex && <Check className="w-3 h-3 text-white drop-shadow" />}
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-[#f1f1ef] dark:border-[#222227] flex items-center justify-between text-[10px] font-mono text-[#8e8d8a] dark:text-[#71717a]">
                        <span>5 Hex Colors</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                          {copiedHex ? `Copied ${copiedHex}` : 'Click to copy'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card 3: GitHub Repo */}
                  {(activeTab === 'all' || activeTab === 'dev') && (
                    <div className="p-3.5 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-[#fbfbfa] dark:bg-[#131316] space-y-2 hover:border-[#cfcfcc] transition-colors shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 font-medium">
                          Development
                        </span>
                        <span className="text-[10px] font-mono text-amber-500 flex items-center gap-0.5">
                          ★ 228k
                        </span>
                      </div>
                      <h4 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">
                        facebook/react
                      </h4>
                      <p className="text-[11px] text-[#787774] dark:text-[#a1a1aa] line-clamp-2">
                        The web and native user interface library. Server components and concurrent primitives.
                      </p>
                      <div className="pt-2 border-t border-[#f1f1ef] dark:border-[#222227] flex items-center justify-between text-[10px] font-mono text-[#8e8d8a] dark:text-[#71717a]">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f7df1e]" />
                          JavaScript
                        </span>
                        <span>MIT License</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES SECTION */}
      <section id="categories" className="py-20 border-t border-[#ececeb] dark:border-[#222227] bg-[#f7f7f5]/60 dark:bg-[#131316]/50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              SIX PRIMARY DISCIPLINES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
              Built for every layer of your stack
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#a1a1aa]">
              Developer knowledge is more than just bookmarks. Shelfspace provides tailored cards and previews for each type.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Design */}
            <div className="p-4.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200/80 dark:border-amber-800/60">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">1. Design & Palettes</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Color palettes, contrast scales, and visual references with interactive click-to-copy hex swatches.
              </p>
            </div>

            {/* UI */}
            <div className="p-4.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200/80 dark:border-emerald-800/60">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">2. UI & Component Kits</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Component directories, Lineicons sets, font previewers, Tailwind UI snippets, and template kits.
              </p>
            </div>

            {/* Development */}
            <div className="p-4.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200/80 dark:border-blue-800/60">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">3. Development & Repos</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Open-source GitHub repositories, starter kits, and npm utilities with auto-extracted star and language badges.
              </p>
            </div>

            {/* Data */}
            <div className="p-4.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200/80 dark:border-purple-800/60">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">4. Data & Public APIs</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Public REST endpoints, GraphQL schemas, test mock datasets, and payloads with authentication status tags.
              </p>
            </div>

            {/* Learning */}
            <div className="p-4.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200/80 dark:border-indigo-800/60">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">5. Learning & Docs</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Framework documentation, system architecture deep dives, cheat sheets, and platform metadata.
              </p>
            </div>

            {/* Personal */}
            <div className="p-4.5 rounded-xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 flex items-center justify-center border border-zinc-200 dark:border-zinc-700/60">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-[#2b2a28] dark:text-[#f4f4f5]">6. Personal Snippets</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Markdown notes, shell commands, setup scripts, and private notes stored directly alongside your links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 border-t border-[#ececeb] dark:border-[#222227] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              SIMPLE WORKFLOW
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
              How Shelfspace works
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#a1a1aa]">
              Engineered around speed, minimal keyboard input, and intuitive categorization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] space-y-2.5 shadow-2xs">
              <div className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400">01.</div>
              <h3 className="font-semibold text-sm text-[#2b2a28] dark:text-[#f4f4f5]">Capture effortlessly</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Paste any link into Quick Add (`N`). Shelfspace auto-extracts titles, OpenGraph previews, descriptions, favicons, and GitHub stars.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] space-y-2.5 shadow-2xs">
              <div className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400">02.</div>
              <h3 className="font-semibold text-sm text-[#2b2a28] dark:text-[#f4f4f5]">Organize in Stacks</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Assign resources to thematic Collections and Projects. Reusing a resource across projects never duplicates the record.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] space-y-2.5 shadow-2xs">
              <div className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400">03.</div>
              <h3 className="font-semibold text-sm text-[#2b2a28] dark:text-[#f4f4f5]">Recall instantly with ⌘K</h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Press `⌘K` from anywhere in your workspace. Full-text search across titles, tags, and notes with instant arrow navigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CORE FEATURES */}
      <section id="features" className="py-20 border-t border-[#ececeb] dark:border-[#222227] bg-[#f7f7f5]/60 dark:bg-[#131316]/50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
              PRODUCTIVITY-FOCUSED
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
              Everything you need, nothing you don't
            </h2>
            <p className="text-xs text-[#787774] dark:text-[#a1a1aa]">
              A blend of Notion workspace clarity and LinkNest visual bookmark elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#f0f0ee] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5] flex items-center justify-center">
                <Command className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5]">
                Fast Command Palette (`⌘K`)
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Never click through nested menus. Search across resources, tags, and collections with instant keyboard navigation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#f0f0ee] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5] flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5]">
                Interactive Palette Swatches
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Save color inspiration and copy hex codes with a single click right on the card without switching windows.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#f0f0ee] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5] flex items-center justify-center">
                <GitFork className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5]">
                Live GitHub Metadata
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Save any GitHub repository URL. Shelfspace extracts stars, forks, languages, and license information automatically.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#18181c] border border-[#ececeb] dark:border-[#26262c] space-y-2 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-[#f0f0ee] dark:bg-[#202026] text-[#2b2a28] dark:text-[#f4f4f5] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[#2b2a28] dark:text-[#f4f4f5]">
                30-Day Recycle Bin Safety
              </h3>
              <p className="text-xs text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
                Accidentally deleted a resource? It stays in the recycle bin for 30 days before permanent purging, so your library stays safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY SHELFSPACE PHILOSOPHY */}
      <section id="why-shelfspace" className="py-20 border-t border-[#ececeb] dark:border-[#222227] px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-semibold">
            BUILT FOR BUILDERS
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            Browser bookmarks were built for 1995.
          </h2>
          <p className="text-xs sm:text-sm text-[#787774] dark:text-[#a1a1aa] leading-relaxed">
            Developers build by connecting ideas: an icon set from Lineicons, a shader experiment from 21st.dev, an open-source repo, or a color palette from Dribbble. Shelfspace is the dedicated workbench where these discoveries stay organized and ready when you build.
          </p>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-20 border-t border-[#ececeb] dark:border-[#222227] bg-[#f7f7f5]/50 dark:bg-[#131316]/50 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4 p-8 sm:p-12 rounded-3xl border border-[#ececeb] dark:border-[#26262c] bg-white dark:bg-[#18181c] shadow-xs">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#2b2a28] dark:text-[#f4f4f5]">
            Start building your second brain today.
          </h2>
          <p className="text-xs sm:text-sm text-[#787774] dark:text-[#a1a1aa] max-w-md mx-auto">
            Free forever for personal workspaces. No spam, no AI slop, just your resources ready when you build.
          </p>
          <div className="pt-2">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                variant="primary"
                pill
                size="lg"
                className="px-6 text-xs font-semibold shadow-xs"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Your Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. PROFESSIONAL FOOTER */}
      <footer className="py-10 border-t border-[#ececeb] dark:border-[#222227] bg-[#fbfbfa] dark:bg-[#0d0d0f] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8e8d8a] dark:text-[#71717a]">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#191919] dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-[10px]">
              S
            </div>
            <span className="font-semibold text-[#2b2a28] dark:text-[#f4f4f5]">Shelfspace</span>
            <span>— Minimal Developer Resource Workspace.</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-[#2b2a28] dark:hover:text-white cursor-pointer transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-[#2b2a28] dark:hover:text-white cursor-pointer transition-colors"
            >
              How It Works
            </button>
            <Link to="/login" className="hover:text-[#2b2a28] dark:hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
