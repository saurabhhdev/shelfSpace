import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import {
  ArrowRight,
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
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#121110] text-[#191715] dark:text-[#f5f2ec] transition-colors duration-200">
      {/* 1. STICKY NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#faf8f5]/85 dark:bg-[#121110]/85 backdrop-blur-md border-b border-[#e6e0d5] dark:border-[#2b2824]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between">
          {/* Logo / Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-[#1e3a2f] text-[#f5f2ec] dark:bg-[#2d5d45] flex items-center justify-center font-bold text-xs shadow-xs border border-[#142820] dark:border-[#3d7d5d]/40">
              S
            </div>
            <span className="font-semibold text-base tracking-tight text-[#191715] dark:text-[#f5f2ec]">
              Shelfspace
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#57524b] dark:text-[#aba499]">
            <button
              onClick={() => scrollTo('features')}
              className="hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('categories')}
              className="hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="hover:text-[#191715] dark:hover:text-[#f5f2ec] transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec] hover:bg-[#ede8df] dark:hover:bg-[#201e1b] transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-[#8a8277]"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#57524b] dark:text-[#aba499]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4 border-b border-[#e6e0d5] dark:border-[#2b2824] bg-[#faf8f5] dark:bg-[#121110] space-y-3 text-sm">
            <button
              onClick={() => scrollTo('features')}
              className="block w-full text-left py-1 text-[#57524b] dark:text-[#aba499]"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('categories')}
              className="block w-full text-left py-1 text-[#57524b] dark:text-[#aba499]"
            >
              Categories
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className="block w-full text-left py-1 text-[#57524b] dark:text-[#aba499]"
            >
              How it works
            </button>
            <div className="pt-2 border-t border-[#e6e0d5] dark:border-[#2b2824] flex gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" className="w-full">
                  <Button size="sm" className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register" className="flex-1">
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#edf4f0] dark:bg-[#1a2b22] border border-[#cadfd5] dark:border-[#2d4d3c] text-[11px] font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1e3a2f] dark:bg-[#86efac]" />
            YOUR DEVELOPER RESOURCE SPACE
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#191715] dark:text-[#f5f2ec] max-w-4xl mx-auto leading-[1.08]">
            Everything useful,
            <br />
            <span className="text-[#1e3a2f] dark:text-[#6ee7b7] font-serif italic font-normal">never lost.</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#57524b] dark:text-[#aba499] max-w-2xl mx-auto leading-relaxed">
            Collect the tools, ideas, repositories and inspiration behind everything you build. One clean, searchable library connected to your projects.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="w-full sm:w-auto px-6" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Explore Shelfspace
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6"
              onClick={() => scrollTo('how-it-works')}
            >
              See how it works
            </Button>
          </div>

          {/* Real Interactive Product Preview Card */}
          <div className="pt-10 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] shadow-xl overflow-hidden text-left transition-all">
              {/* Fake Chrome / Header */}
              <div className="px-4 py-3 border-b border-[#ede8df] dark:border-[#24221f] bg-[#f5f2eb]/60 dark:bg-[#1c1a17] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ded8cb] dark:bg-[#38342e]" />
                  <span className="w-3 h-3 rounded-full bg-[#ded8cb] dark:bg-[#38342e]" />
                  <span className="w-3 h-3 rounded-full bg-[#ded8cb] dark:bg-[#38342e]" />
                  <span className="text-xs font-mono text-[#8a8277] ml-2 hidden sm:inline">
                    shelfspace.app/library
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#22201d] border border-[#e2dcd0] dark:border-[#2f2c27] text-xs font-mono text-[#8a8277]">
                    <Command className="w-3 h-3" />
                    <span>K</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#edf4f0] dark:bg-[#1e3a2f]/40 text-[#1e3a2f] dark:text-[#86efac] font-medium border border-[#cadfd5] dark:border-[#2e6349]/50">
                    Live Workspace
                  </span>
                </div>
              </div>

              {/* Mock App Content */}
              <div className="p-4 sm:p-6 space-y-4">
                {/* Search Bar + Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 max-w-md h-9 px-3 rounded-lg bg-[#faf8f5] dark:bg-[#141311] border border-[#ded8cb] dark:border-[#2f2c27] text-xs text-[#8a8277]">
                    <Search className="w-3.5 h-3.5" />
                    <span>Search icons, design palettes, repositories...</span>
                  </div>

                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#f5f2eb] dark:bg-[#22201d] text-xs">
                    {(['all', 'ui', 'design', 'dev'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          'px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer',
                          activeTab === tab
                            ? 'bg-white dark:bg-[#191816] text-[#191715] dark:text-[#f5f2ec] shadow-xs'
                            : 'text-[#8a8277] hover:text-[#191715] dark:hover:text-[#f5f2ec]'
                        )}
                      >
                        {tab === 'all' ? 'All' : tab === 'dev' ? 'Development' : tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 Real Previews Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  {/* Card 1: Lineicons */}
                  {(activeTab === 'all' || activeTab === 'ui') && (
                    <div className="p-4 rounded-xl border border-[#ded8cb] dark:border-[#2f2c27] bg-[#faf8f5] dark:bg-[#141311] space-y-2.5 hover:border-[#cadfd5] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] border border-[#cce1d6] dark:border-[#2d4d3c]">
                          UI / Icons
                        </span>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      </div>
                      <h4 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">
                        Lineicons 8,400+ Vector Icons
                      </h4>
                      <p className="text-xs text-[#57524b] dark:text-[#aba499] line-clamp-2">
                        Handcrafted line and duotone icons built for developer tool dashboards and web apps.
                      </p>
                      <div className="pt-2 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-[10px] font-mono text-[#8a8277]">
                        <span>lineicons.com</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#f5f2eb] dark:bg-[#201e1b]">#icons</span>
                      </div>
                    </div>
                  )}

                  {/* Card 2: Palette Swatches */}
                  {(activeTab === 'all' || activeTab === 'design') && (
                    <div className="p-4 rounded-xl border border-[#ded8cb] dark:border-[#2f2c27] bg-[#faf8f5] dark:bg-[#141311] space-y-2.5 hover:border-[#cadfd5] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#faf0eb] dark:bg-[#2b1f1a] text-[#9c4221] dark:text-[#f09a7d] border border-[#f0ded5] dark:border-[#422c24]">
                          Design / Palette
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#8a8277]" />
                      </div>
                      <h4 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">
                        Nordic Slate & Forest Green
                      </h4>
                      {/* Swatches */}
                      <div className="flex gap-1.5 py-1">
                        {['#191715', '#2a2723', '#1e3a2f', '#4ade80', '#faf8f5'].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => handleCopyColor(hex)}
                            title={`Click to copy ${hex}`}
                            className="flex-1 h-6 rounded border border-black/10 dark:border-white/10 hover:scale-105 transition-transform flex items-center justify-center cursor-pointer"
                            style={{ backgroundColor: hex }}
                          >
                            {copiedHex === hex && <Check className="w-3 h-3 text-white" />}
                          </button>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-[10px] font-mono text-[#8a8277]">
                        <span>5 Hex Codes</span>
                        <span className="text-[#1e3a2f] dark:text-[#86efac]">Click to copy</span>
                      </div>
                    </div>
                  )}

                  {/* Card 3: GitHub Repo */}
                  {(activeTab === 'all' || activeTab === 'dev') && (
                    <div className="p-4 rounded-xl border border-[#ded8cb] dark:border-[#2f2c27] bg-[#faf8f5] dark:bg-[#141311] space-y-2.5 hover:border-[#cadfd5] transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#edf2f7] dark:bg-[#1d242e] text-[#2d3748] dark:text-[#90cdf4] border border-[#d8e2ed] dark:border-[#2b394b]">
                          Development
                        </span>
                        <span className="text-[11px] font-mono text-amber-500 flex items-center gap-0.5">
                          ★ 228k
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">
                        facebook/react
                      </h4>
                      <p className="text-xs text-[#57524b] dark:text-[#aba499] line-clamp-2">
                        The library for web and native user interfaces. Server components and concurrent primitives.
                      </p>
                      <div className="pt-2 border-t border-[#ede8df] dark:border-[#24221f] flex items-center justify-between text-[10px] font-mono text-[#8a8277]">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#f7df1e]" />
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

      {/* 3. RESOURCE CATEGORIES */}
      <section id="categories" className="py-20 border-t border-[#e6e0d5] dark:border-[#2b2824] bg-[#f5f2eb]/40 dark:bg-[#161513]/40 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
              ALL SIX PRIMARY DISCIPLINES
            </span>
            <h2 className="text-3xl font-bold text-[#191715] dark:text-[#f5f2ec]">
              Built for every piece of software you make
            </h2>
            <p className="text-xs text-[#57524b] dark:text-[#aba499]">
              Developer knowledge is more than just bookmarks. Shelfspace treats different resource types with tailored views.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Design */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#faf0eb] dark:bg-[#2b1f1a] text-[#9c4221] dark:text-[#f09a7d] flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">1. Design Resources</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Color palettes, contrast tokens, gradient scales, and visual design references with interactive copyable hex swatches.
              </p>
            </div>

            {/* UI */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] flex items-center justify-center">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">2. UI Resources</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Component directories, Lineicons sets, typography font previews, Tailwind UI snippets, and template kits.
              </p>
            </div>

            {/* Development */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#edf2f7] dark:bg-[#1d242e] text-[#2d3748] dark:text-[#90cdf4] flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">3. Development</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Open-source GitHub repositories, starter kits, npm utilities, and benchmarks with auto-extracted stars and language tags.
              </p>
            </div>

            {/* Data */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#fef7ee] dark:bg-[#2e2316] text-[#b45309] dark:text-[#fcd34d] flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">4. Data & APIs</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Public REST endpoints, GraphQL schemas, dummy mock datasets, and testing payloads with authentication badges.
              </p>
            </div>

            {/* Learning */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#eff6ff] dark:bg-[#17253d] text-[#1d4ed8] dark:text-[#93c5fd] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">5. Learning</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Official framework documentation, deep-dive architecture tutorials, cheat sheets, and estimated reading times.
              </p>
            </div>

            {/* Personal */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#f5f2eb] dark:bg-[#24221f] text-[#57524b] dark:text-[#d1cbc2] flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-[#191715] dark:text-[#f5f2ec]">6. Personal Notes</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Markdown snippets, setup instructions, terminal commands, and private ideas without needing an external doc tool.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 border-t border-[#e6e0d5] dark:border-[#2b2824] px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
              INTENTIONAL WORKFLOW
            </span>
            <h2 className="text-3xl font-bold text-[#191715] dark:text-[#f5f2ec]">
              How Shelfspace works
            </h2>
            <p className="text-xs text-[#57524b] dark:text-[#aba499]">
              Three fast steps designed around developer speed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] space-y-3">
              <div className="text-2xl font-serif italic text-[#1e3a2f] dark:text-[#86efac]">01.</div>
              <h3 className="font-semibold text-base">Collect effortlessly</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Paste any URL into Quick Add (`N`). Shelfspace uses SSRF-safe crawlers to auto-extract titles, OpenGraph visuals, descriptions, and GitHub stars.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] space-y-3">
              <div className="text-2xl font-serif italic text-[#1e3a2f] dark:text-[#86efac]">02.</div>
              <h3 className="font-semibold text-base">Organize flexibly</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Associate a resource with multiple Projects and Collections. Deleting a project never deletes the resource—your library remains intact.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#ded8cb] dark:border-[#2f2c27] bg-white dark:bg-[#191816] space-y-3">
              <div className="text-2xl font-serif italic text-[#1e3a2f] dark:text-[#86efac]">03.</div>
              <h3 className="font-semibold text-base">Find & reuse in seconds</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Hit `⌘K` from anywhere. Instant debounced full-text search across titles, descriptions, markdown notes, and tags with arrow-key jump.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURE SHOWCASE */}
      <section id="features" className="py-20 border-t border-[#e6e0d5] dark:border-[#2b2824] bg-[#f5f2eb]/40 dark:bg-[#161513]/40 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
              CORE ADVANTAGES
            </span>
            <h2 className="text-3xl font-bold text-[#191715] dark:text-[#f5f2ec]">
              Designed for speed, not clutter
            </h2>
            <p className="text-xs text-[#57524b] dark:text-[#aba499]">
              Every interaction is tuned to feel tactile, fast, and respectful of your focus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#edf4f0] dark:bg-[#1a2b22] text-[#1e3a2f] dark:text-[#86efac] flex items-center justify-center">
                <Command className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base">Raycast-Style Command Palette</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Never click through endless menus. Press `⌘K` or `Ctrl+K` to search across your workspace with instant keyboard shortcuts and live filters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#faf0eb] dark:bg-[#2b1f1a] text-[#9c4221] dark:text-[#f09a7d] flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base">Interactive Palette Previews</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Save color inspiration and copy hex codes with a single click right on the card—no need to open external tools or copy-paste from notes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#edf2f7] dark:bg-[#1d242e] text-[#2d3748] dark:text-[#90cdf4] flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base">Live GitHub Intelligence</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                Save any GitHub repository URL. Shelfspace extracts stars, forks, language badges, and topics, with one-click metadata refresh anytime.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#191816] border border-[#ded8cb] dark:border-[#2f2c27] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#fef7ee] dark:bg-[#2e2316] text-[#b45309] dark:text-[#fcd34d] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-base">Privacy & 30-Day Recycle Safety</h3>
              <p className="text-xs text-[#57524b] dark:text-[#aba499] leading-relaxed">
                HTTP-only cookie security, per-user duplicate prevention, and automated 30-day trash retention so you never lose work by accident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ABOUT SECTION */}
      <section id="about" className="py-20 border-t border-[#e6e0d5] dark:border-[#2b2824] px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#1e3a2f] dark:text-[#86efac]">
            WHY SHELFSPACE EXISTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191715] dark:text-[#f5f2ec]">
            Bookmarks were built for 1995.
            <br />
            Developers build differently today.
          </h2>
          <p className="text-sm text-[#57524b] dark:text-[#aba499] leading-relaxed">
            Software development is an assembly of discoveries: that one perfect icon set on Lineicons, that clean shader on 21st.dev, that obscure GitHub library, or that custom color token from Dribbble. Shelfspace is your private workbench to keep discoveries alive.
          </p>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-20 border-t border-[#e6e0d5] dark:border-[#2b2824] bg-[#edf4f0]/50 dark:bg-[#1a2b22]/30 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-5 p-8 sm:p-12 rounded-3xl border border-[#cadfd5] dark:border-[#2d4d3c]/50 bg-white dark:bg-[#191816]">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#191715] dark:text-[#f5f2ec]">
            Start building your personal library today.
          </h2>
          <p className="text-sm text-[#57524b] dark:text-[#aba499] max-w-xl mx-auto">
            Free forever for personal workspaces. Zero clutter, zero AI slop, just your resources ready when you build.
          </p>
          <div className="pt-2">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" className="px-7" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Create Your Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. MINIMAL FOOTER */}
      <footer className="py-12 border-t border-[#e6e0d5] dark:border-[#2b2824] bg-[#faf8f5] dark:bg-[#121110] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a8277]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#1e3a2f] text-[#f5f2ec] flex items-center justify-center font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-[#191715] dark:text-[#f5f2ec]">Shelfspace</span>
            <span>— The Developer Resource Management Workspace.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => scrollTo('features')} className="hover:text-[#191715] dark:hover:text-[#f5f2ec] cursor-pointer">
              Features
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#191715] dark:hover:text-[#f5f2ec] cursor-pointer">
              How it works
            </button>
            <Link to="/login" className="hover:text-[#191715] dark:hover:text-[#f5f2ec]">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
