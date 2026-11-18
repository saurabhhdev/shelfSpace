import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Flaticon } from '../ui/Flaticon';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TourStage = 'welcome' | 'tour' | 'complete';

interface DemoResource {
  id: string;
  title: string;
  url: string;
  type: 'component' | 'tool' | 'repo' | 'snippet' | 'article';
  category: string;
  tags: string[];
  description: string;
  isFavorite: boolean;
  icon: string;
}

const INITIAL_DEMO_RESOURCES: DemoResource[] = [
  {
    id: 'res-1',
    title: 'Radix UI Primitives',
    url: 'https://radix-ui.com',
    type: 'component',
    category: 'UI Components',
    tags: ['react', 'accessibility', 'tailwind'],
    description: 'Unstyled, accessible UI components for building high-quality design systems and web apps in React.',
    isFavorite: true,
    icon: 'apps',
  },
  {
    id: 'res-2',
    title: 'Lucide Icons',
    url: 'https://lucide.dev',
    type: 'tool',
    category: 'Design Assets',
    tags: ['icons', 'svg', 'react'],
    description: 'Beautiful & consistent icon toolkit made by the community. Open source and customizable.',
    isFavorite: true,
    icon: 'star',
  },
  {
    id: 'res-3',
    title: 'Tailwind CSS v4',
    url: 'https://tailwindcss.com',
    type: 'tool',
    category: 'Frontend Tools',
    tags: ['css', 'styling', 'framework'],
    description: 'A utility-first CSS framework packed with classes that can be composed to build any design.',
    isFavorite: false,
    icon: 'settings-sliders',
  },
  {
    id: 'res-4',
    title: 'Supabase Studio & Auth',
    url: 'https://supabase.com',
    type: 'repo',
    category: 'Backend & APIs',
    tags: ['postgres', 'auth', 'database'],
    description: 'Open source Firebase alternative providing Postgres database, Authentication, and instant APIs.',
    isFavorite: false,
    icon: 'folder-open',
  },
  {
    id: 'res-5',
    title: 'useDebounce Hook',
    url: 'https://usehooks.com/usedebounce',
    type: 'snippet',
    category: 'Code Snippets',
    tags: ['react', 'hooks', 'performance'],
    description: 'Lightweight React custom hook to debounce rapidly changing values like live search inputs.',
    isFavorite: true,
    icon: 'boxes',
  },
];

export const ProductTourModal: React.FC<ProductTourModalProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [stage, setStage] = useState<TourStage>('welcome');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Demo Interactive States
  const [demoResources, setDemoResources] = useState<DemoResource[]>(INITIAL_DEMO_RESOURCES);
  const [demoViewMode, setDemoViewMode] = useState<'grid' | 'list'>('grid');
  const [demoSearchQuery, setDemoSearchQuery] = useState<string>('');
  const [demoActiveTypeFilter, setDemoActiveTypeFilter] = useState<string>('all');
  const [demoAddMode, setDemoAddMode] = useState<'auto' | 'manual'>('auto');
  const [demoAutoUrl, setDemoAutoUrl] = useState<string>('https://github.com/shadcn/ui');
  const [demoIsFetching, setDemoIsFetching] = useState<boolean>(false);
  const [demoFetchSuccess, setDemoFetchSuccess] = useState<boolean>(true);
  const [demoActiveProjectTab, setDemoActiveProjectTab] = useState<'overview' | 'workspace'>('workspace');

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset tour state on open
  useEffect(() => {
    if (isOpen) {
      setStage('welcome');
      setCurrentStep(1);
      setDemoSearchQuery('');
      setDemoActiveTypeFilter('all');
      setDemoResources(INITIAL_DEMO_RESOURCES);
      setDemoAddMode('auto');
    }
  }, [isOpen]);

  const toggleDemoFavorite = (id: string) => {
    setDemoResources((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const simulateFetch = () => {
    setDemoIsFetching(true);
    setDemoFetchSuccess(false);
    setTimeout(() => {
      setDemoIsFetching(false);
      setDemoFetchSuccess(true);
    }, 600);
  };

  // Filtered resources for Step 5
  const filteredDemoResources = useMemo(() => {
    return demoResources.filter((item) => {
      const matchesSearch =
        demoSearchQuery.trim() === '' ||
        item.title.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(demoSearchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(demoSearchQuery.toLowerCase()));

      const matchesType =
        demoActiveTypeFilter === 'all' ||
        (demoActiveTypeFilter === 'favorites' ? item.isFavorite : item.type === demoActiveTypeFilter);

      return matchesSearch && matchesType;
    });
  }, [demoResources, demoSearchQuery, demoActiveTypeFilter]);

  if (!isOpen) return null;

  const tourStepsMeta = [
    {
      step: 1,
      title: 'Your Resources',
      badge: '01 / 05',
      summary: 'Keep your tools, repositories, components, and snippets together.',
      description:
        'Instead of scattering bookmarks across different browsers, Slack messages, and note apps, Shelfspace gives you a single personal catalog for everything you find useful while building.',
      highlights: [
        'Central library for repos, UI components, tools & snippets',
        'Quick toggle between responsive Grid and compact List view',
        'One-click favorite stars to pin your everyday essentials',
      ],
    },
    {
      step: 2,
      title: 'Add Resources',
      badge: '02 / 05',
      summary: 'Auto-extract link details or add custom resources manually.',
      description:
        'Save resources effortlessly. Paste any URL and Shelfspace automatically grabs the title, description, favicon, and tags—or switch to Manual Add whenever you want full granular control.',
      highlights: [
        'Smart Auto Add fetches metadata and preview images instantly',
        'Automatic category suggestions based on link content',
        'Manual Add mode for private code snippets and internal tools',
      ],
    },
    {
      step: 3,
      title: 'Organize Your Collection',
      badge: '03 / 05',
      summary: 'Structured categories, customizable tags, and instant favorites.',
      description:
        'Organize resources your way. Group references into color-coded categories, attach multiple tags, and star the cheatsheets and libraries you reach for every day.',
      highlights: [
        'Custom categories with personalized color badges',
        'Multi-tag taxonomy for flexible cross-cutting organization',
        'Instant Favorites view for zero-friction access',
      ],
    },
    {
      step: 4,
      title: 'Organize by Projects',
      badge: '04 / 05',
      summary: 'Group resources by project without duplicating them.',
      description:
        'Set up dedicated project workspaces for whatever you are currently building. Attach the exact tools, documentation, and references needed—and reuse the same resource across multiple projects.',
      highlights: [
        'Dedicated project workspaces with active status tracking',
        'Single resource can belong to multiple projects',
        'Archive projects when finished to keep workspace clean',
      ],
    },
    {
      step: 5,
      title: 'Find What You Need',
      badge: '05 / 05',
      summary: 'Instant fuzzy search and multi-criteria filters.',
      description:
        'Never lose a link again. Quickly pull up any resource using live search, filter by resource type, or drill down by tags. Try typing in the demo search bar on the right!',
      highlights: [
        'Real-time search across titles, descriptions, and tags',
        'Fast filter pills for UI components, tools, repos, and snippets',
        'No pagination friction—jump directly to what you need',
      ],
    },
  ];

  const currentStepData = tourStepsMeta[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setStage('complete');
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      {/* Outer Card Container */}
      <div className="relative w-full max-w-5xl bg-[#1C1C1B] border border-[#3E3E38] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* =====================================================================
            TOP BAR / HEADER
           ===================================================================== */}
        <div className="px-5 py-3.5 border-b border-[#3E3E38] bg-[#262624]/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-[#141413] border border-[#3E3E38] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]"></span>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF9F5] font-mono">
              Shelfspace Product Tour
            </span>
          </div>

          <div className="flex items-center gap-3">
            {stage === 'tour' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-[#83827D]">
                <span>Step {currentStep} of 5</span>
              </div>
            )}
            <button
              onClick={onClose}
              aria-label="Close product tour"
              className="p-1.5 rounded-md text-[#B7B5A9] hover:text-[#FAF9F5] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Flaticon name="cross" className="text-xs" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            STAGE 1: WELCOME SCREEN
           ===================================================================== */}
        {stage === 'welcome' && (
          <div className="p-6 sm:p-10 lg:p-12 overflow-y-auto text-center flex flex-col items-center justify-center my-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97757]/10 border border-[#D97757]/25 text-[#D97757] text-xs font-mono mb-6">
              <Flaticon name="sparkles" className="text-xs" />
              <span>Interactive Walkthrough • No account required</span>
            </div>

            <h2
              id="tour-modal-title"
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight max-w-xl"
            >
              Take a quick look around.
            </h2>

            <p className="mt-4 text-sm sm:text-base text-[#B7B5A9] max-w-lg leading-relaxed">
              Here&apos;s how you can keep your developer resources organized and easy to find. Explore the 5 core capabilities in under a minute.
            </p>

            {/* Feature Teasers Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl w-full text-left">
              <div className="p-4 rounded-lg bg-[#262624]/60 border border-[#3E3E38]">
                <div className="w-7 h-7 rounded bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center text-[#D97757] mb-2.5">
                  <Flaticon name="apps" className="text-xs" />
                </div>
                <div className="text-xs font-semibold text-[#FAF9F5]">Central Catalog</div>
                <div className="text-[11px] text-[#83827D] mt-1">Keep repos, tools, UI kits, and snippets unified.</div>
              </div>

              <div className="p-4 rounded-lg bg-[#262624]/60 border border-[#3E3E38]">
                <div className="w-7 h-7 rounded bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center text-[#D97757] mb-2.5">
                  <Flaticon name="sparkles" className="text-xs" />
                </div>
                <div className="text-xs font-semibold text-[#FAF9F5]">Smart Auto Add</div>
                <div className="text-[11px] text-[#83827D] mt-1">Paste a link to fetch metadata & tags in 1 click.</div>
              </div>

              <div className="p-4 rounded-lg bg-[#262624]/60 border border-[#3E3E38]">
                <div className="w-7 h-7 rounded bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center text-[#D97757] mb-2.5">
                  <Flaticon name="folder" className="text-xs" />
                </div>
                <div className="text-xs font-semibold text-[#FAF9F5]">Project Workspaces</div>
                <div className="text-[11px] text-[#83827D] mt-1">Group resources by build without duplication.</div>
              </div>
            </div>

            {/* Welcome Actions */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setStage('tour')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-7 h-10 text-xs sm:text-sm font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <span>Start Tour</span>
                <Flaticon name="arrow-right" className="text-xs" />
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#262624] px-6 h-10 text-xs sm:text-sm font-medium text-[#B7B5A9] hover:text-[#FAF9F5] border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Skip to Website
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 2: FIVE TOUR STEPS (Interactive Walkthrough)
           ===================================================================== */}
        {stage === 'tour' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
            {/* -----------------------------------------------------------------
                LEFT NARRATIVE COLUMN (Desktop ~38%, Mobile Top)
               ----------------------------------------------------------------- */}
            <div className="w-full md:w-[360px] lg:w-[400px] p-5 sm:p-7 md:border-r border-b md:border-b-0 border-[#3E3E38] bg-[#262624]/40 flex flex-col justify-between shrink-0 overflow-y-auto">
              <div>
                {/* Step Pill & Step Dots */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold text-[#D97757] tracking-wider bg-[#D97757]/10 px-2 py-0.5 rounded border border-[#D97757]/20">
                    Step {currentStepData.badge}
                  </span>

                  {/* Step Navigation Dots */}
                  <div className="flex items-center gap-1.5">
                    {tourStepsMeta.map((s) => (
                      <button
                        key={s.step}
                        onClick={() => setCurrentStep(s.step)}
                        aria-label={`Jump to step ${s.step}: ${s.title}`}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all duration-200 cursor-pointer',
                          currentStep === s.step
                            ? 'w-6 bg-[#D97757]'
                            : currentStep > s.step
                            ? 'bg-[#83827D] hover:bg-[#B7B5A9]'
                            : 'bg-[#3E3E38] hover:bg-[#52514A]'
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Step Title & Summary */}
                <h3 className="text-xl sm:text-2xl font-bold text-[#FAF9F5] tracking-tight">
                  {currentStepData.title}
                </h3>
                <p className="mt-1 text-xs sm:text-sm font-medium text-[#D97757]">
                  {currentStepData.summary}
                </p>

                {/* Detailed Narrative */}
                <p className="mt-3.5 text-xs sm:text-sm text-[#B7B5A9] leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Highlights List */}
                <div className="mt-5 space-y-2 pt-4 border-t border-[#3E3E38]/70">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#83827D]">
                    Key Capabilities
                  </div>
                  {currentStepData.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#FAF9F5]">
                      <span className="inline-flex h-4 w-4 rounded bg-[#D97757]/15 text-[#D97757] items-center justify-center shrink-0 mt-0.5 text-[10px]">
                        ✓
                      </span>
                      <span className="leading-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Nav Controls */}
              <div className="mt-6 pt-4 border-t border-[#3E3E38] flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={onClose}
                  className="text-xs text-[#83827D] hover:text-[#FAF9F5] transition-colors cursor-pointer"
                >
                  Skip Tour
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-md px-3 h-8 text-xs font-medium border border-[#3E3E38] transition-all cursor-pointer',
                      currentStep === 1
                        ? 'opacity-30 cursor-not-allowed bg-transparent text-[#83827D]'
                        : 'bg-[#1C1C1B] hover:bg-[#262624] text-[#FAF9F5] active:scale-[0.98]'
                    )}
                  >
                    <Flaticon name="arrow-left" className="text-[10px]" />
                    <span>Previous</span>
                  </button>

                  <button
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-4 h-8 text-xs font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_2px_0_rgba(0,0,0,0.35)] transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>{currentStep === 5 ? 'Finish' : 'Next'}</span>
                    <Flaticon name="arrow-right" className="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------------
                RIGHT VISUAL PREVIEW STAGE (Interactive Demo Interface)
               ----------------------------------------------------------------- */}
            <div className="flex-1 bg-[#141413] p-3 sm:p-5 overflow-y-auto flex flex-col justify-start">
              {/* Simulated Browser Frame */}
              <div className="w-full bg-[#1C1C1B] rounded-lg border border-[#3E3E38] shadow-lg overflow-hidden flex flex-col">
                {/* Browser Header Bar */}
                <div className="px-3 py-2 bg-[#262624] border-b border-[#3E3E38] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block"></span>
                  </div>
                  <div className="px-3 py-0.5 rounded bg-[#141413] border border-[#3E3E38] text-[11px] font-mono text-[#83827D] max-w-xs truncate">
                    shelfspace.app/
                    {currentStep === 1
                      ? 'library'
                      : currentStep === 2
                      ? 'resources/add'
                      : currentStep === 3
                      ? 'collections'
                      : currentStep === 4
                      ? 'projects/workspace'
                      : 'search?q=' + encodeURIComponent(demoSearchQuery || 'react')}
                  </div>
                  <div className="text-[10px] text-[#83827D] font-mono">LIVE PREVIEW</div>
                </div>

                {/* Dynamic Preview Contents by Step */}
                <div className="p-3.5 sm:p-4 min-h-[380px] flex flex-col justify-between">
                  {/* STEP 1: ALL RESOURCES INTERFACE */}
                  {currentStep === 1 && (
                    <div className="space-y-3.5">
                      {/* Header controls inside preview */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#3E3E38]">
                        <div className="text-xs font-semibold text-[#FAF9F5]">All Resources (5)</div>
                        <div className="flex items-center gap-1.5">
                          {/* Segmented view switcher */}
                          <div className="flex rounded border border-[#3E3E38] bg-[#141413] p-0.5">
                            <button
                              onClick={() => setDemoViewMode('grid')}
                              className={cn(
                                'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                                demoViewMode === 'grid'
                                  ? 'bg-[#262624] text-[#FAF9F5] shadow-xs'
                                  : 'text-[#83827D] hover:text-[#FAF9F5]'
                              )}
                            >
                              Grid
                            </button>
                            <button
                              onClick={() => setDemoViewMode('list')}
                              className={cn(
                                'px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer',
                                demoViewMode === 'list'
                                  ? 'bg-[#262624] text-[#FAF9F5] shadow-xs'
                                  : 'text-[#83827D] hover:text-[#FAF9F5]'
                              )}
                            >
                              List
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Render resources */}
                      <div
                        className={cn(
                          'gap-2.5',
                          demoViewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'
                        )}
                      >
                        {demoResources.map((res) => (
                          <div
                            key={res.id}
                            className="p-3 rounded-md bg-[#262624]/60 hover:bg-[#262624] border border-[#3E3E38] transition-colors group flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded bg-[#1C1C1B] border border-[#3E3E38] flex items-center justify-center text-[#D97757]">
                                    <Flaticon name={res.icon} className="text-[10px]" />
                                  </div>
                                  <h4 className="text-xs font-semibold text-[#FAF9F5] group-hover:text-white truncate">
                                    {res.title}
                                  </h4>
                                </div>
                                <button
                                  onClick={() => toggleDemoFavorite(res.id)}
                                  title="Toggle favorite in demo"
                                  className={cn(
                                    'p-1 rounded transition-colors cursor-pointer',
                                    res.isFavorite
                                  ? 'text-amber-400 bg-amber-400/10'
                                      : 'text-[#83827D] hover:text-amber-300'
                                  )}
                                >
                                  <Flaticon name="star" className="text-[10px]" />
                                </button>
                              </div>
                              <p className="text-[11px] text-[#B7B5A9] line-clamp-2 leading-relaxed">
                                {res.description}
                              </p>
                            </div>
                            <div className="mt-2.5 pt-2 border-t border-[#3E3E38]/50 flex items-center justify-between text-[10px] text-[#83827D]">
                              <span className="font-mono text-[#D97757]">{res.category}</span>
                              <div className="flex gap-1">
                                {res.tags.slice(0, 2).map((t) => (
                                  <span key={t} className="px-1.5 py-0.5 rounded bg-[#1C1C1B] border border-[#3E3E38]/60">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-center pt-1 text-[11px] text-[#83827D] font-mono">
                        💡 Tip: Click any star to test live bookmarking or switch between Grid and List view.
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ADD RESOURCE (AUTO & MANUAL) */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      {/* Tabs: Auto Add vs Manual Add */}
                      <div className="flex items-center justify-between border-b border-[#3E3E38] pb-2.5">
                        <div className="text-xs font-semibold text-[#FAF9F5]">Add New Resource</div>
                        <div className="flex rounded border border-[#3E3E38] bg-[#141413] p-0.5">
                          <button
                            onClick={() => setDemoAddMode('auto')}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
                              demoAddMode === 'auto'
                                ? 'bg-[#262624] text-[#FAF9F5] shadow-xs'
                                : 'text-[#83827D] hover:text-[#FAF9F5]'
                            )}
                          >
                            <Flaticon name="sparkles" className="text-[10px] text-[#D97757]" />
                            <span>Auto Add</span>
                          </button>
                          <button
                            onClick={() => setDemoAddMode('manual')}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer',
                              demoAddMode === 'manual'
                                ? 'bg-[#262624] text-[#FAF9F5] shadow-xs'
                                : 'text-[#83827D] hover:text-[#FAF9F5]'
                            )}
                          >
                            <Flaticon name="pencil" className="text-[10px]" />
                            <span>Manual Add</span>
                          </button>
                        </div>
                      </div>

                      {demoAddMode === 'auto' ? (
                        <div className="space-y-3">
                          <label className="text-xs text-[#B7B5A9] block">
                            Paste Resource URL (Website, GitHub, NPM, Article)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={demoAutoUrl}
                              onChange={(e) => setDemoAutoUrl(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-md bg-[#262624] border border-[#3E3E38] text-xs text-[#FAF9F5] focus:outline-none focus:border-[#D97757] font-mono"
                              placeholder="https://..."
                            />
                            <button
                              onClick={simulateFetch}
                              disabled={demoIsFetching}
                              className="px-3.5 py-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] text-xs font-medium text-[#141413] transition-all cursor-pointer shrink-0"
                            >
                              {demoIsFetching ? 'Fetching...' : 'Fetch Details'}
                            </button>
                          </div>

                          {demoFetchSuccess && (
                            <div className="p-3.5 rounded-md bg-[#262624]/70 border border-[#3E3E38] space-y-2.5 animate-fade-in">
                              <div className="flex items-center justify-between text-[11px] text-[#D97757] font-mono">
                                <span>✓ Metadata extracted automatically</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  GitHub Repo
                                </span>
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[#FAF9F5]">shadcn/ui</div>
                                <div className="text-[11px] text-[#B7B5A9] mt-0.5">
                                  Beautifully designed components that you can copy and paste into your apps. Accessible, customizable, open source.
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="px-2 py-0.5 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[10px] text-[#FAF9F5]">
                                  Category: UI Components
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[10px] text-[#83827D]">
                                  #react
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[10px] text-[#83827D]">
                                  #tailwind
                                </span>
                                <span className="px-2 py-0.5 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[10px] text-[#83827D]">
                                  #components
                                </span>
                              </div>
                            </div>
                          )}

                          <button className="w-full py-2 rounded-md bg-[#D97757] hover:bg-[#EE8360] text-[#FAF9F5] text-xs font-medium shadow-sm transition-all cursor-pointer">
                            Save to Shelfspace
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[11px] text-[#B7B5A9] block mb-1">Resource Name</label>
                            <input
                              type="text"
                              readOnly
                              value="Postgres Connection Pool Snippet"
                              className="w-full px-2.5 py-1.5 rounded bg-[#262624] border border-[#3E3E38] text-xs text-[#FAF9F5]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-[#B7B5A9] block mb-1">Type</label>
                              <div className="px-2.5 py-1.5 rounded bg-[#262624] border border-[#3E3E38] text-xs text-[#FAF9F5]">
                                Code Snippet
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-[#B7B5A9] block mb-1">Category</label>
                              <div className="px-2.5 py-1.5 rounded bg-[#262624] border border-[#3E3E38] text-xs text-[#FAF9F5]">
                                Backend & Database
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] text-[#B7B5A9] block mb-1">Tags</label>
                            <div className="flex gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-[#262624] border border-[#3E3E38] text-[11px] text-[#FAF9F5]">
                                postgres ✕
                              </span>
                              <span className="px-2 py-0.5 rounded bg-[#262624] border border-[#3E3E38] text-[11px] text-[#FAF9F5]">
                                nodejs ✕
                              </span>
                            </div>
                          </div>
                          <button className="w-full py-2 rounded-md bg-[#D97757] hover:bg-[#EE8360] text-[#FAF9F5] text-xs font-medium shadow-sm transition-all cursor-pointer">
                            Save Resource Manually
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: ORGANIZE YOUR COLLECTION */}
                  {currentStep === 3 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-[#3E3E38]">
                        <div className="text-xs font-semibold text-[#FAF9F5]">Categories & Taxonomies</div>
                        <div className="text-[11px] font-mono text-[#D97757]">3 Collections Active</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="p-3 rounded-md bg-[#262624]/60 border border-[#3E3E38] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#D97757]"></span>
                            <span className="text-xs font-bold text-[#FAF9F5]">UI Systems</span>
                          </div>
                          <div className="text-[11px] text-[#83827D]">18 Saved Items</div>
                          <div className="flex flex-wrap gap-1 text-[10px] text-[#B7B5A9]">
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C1B]">#react</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C1B]">#tailwind</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-[#262624]/60 border border-[#3E3E38] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                            <span className="text-xs font-bold text-[#FAF9F5]">Dev Tools</span>
                          </div>
                          <div className="text-[11px] text-[#83827D]">24 Saved Items</div>
                          <div className="flex flex-wrap gap-1 text-[10px] text-[#B7B5A9]">
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C1B]">#cli</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C1B]">#terminal</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-[#262624]/60 border border-[#3E3E38] space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                            <span className="text-xs font-bold text-[#FAF9F5]">Backend</span>
                          </div>
                          <div className="text-[11px] text-[#83827D]">12 Saved Items</div>
                          <div className="flex flex-wrap gap-1 text-[10px] text-[#B7B5A9]">
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C1B]">#postgres</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#1C1C1B]">#api</span>
                          </div>
                        </div>
                      </div>

                      {/* Favorites spotlight bar */}
                      <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flaticon name="star" className="text-xs text-amber-400" />
                          <span className="text-xs font-medium text-amber-200">
                            Favorites Filter: 8 items starred for immediate recall
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-amber-300">Quick Access</span>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: ORGANIZE BY PROJECTS */}
                  {currentStep === 4 && (
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between pb-2 border-b border-[#3E3E38]">
                        <div className="text-xs font-semibold text-[#FAF9F5]">
                          Project Workspace: SaaS Platform 2026
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono">
                            ● Active
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-md bg-[#262624]/70 border border-[#3E3E38] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#FAF9F5] font-semibold">Attached Resources (4)</span>
                          <span className="text-[11px] text-[#83827D]">Shared across projects</span>
                        </div>
                        <p className="text-[11px] text-[#B7B5A9] leading-relaxed">
                          Resources belong directly to this project workspace without duplicating your data:
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="p-2 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[11px] text-[#FAF9F5] flex items-center gap-1.5">
                            <span className="text-[#D97757]">◈</span> Radix UI Primitives
                          </div>
                          <div className="p-2 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[11px] text-[#FAF9F5] flex items-center gap-1.5">
                            <span className="text-[#D97757]">◈</span> Tailwind CSS v4
                          </div>
                          <div className="p-2 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[11px] text-[#FAF9F5] flex items-center gap-1.5">
                            <span className="text-[#D97757]">◈</span> Supabase Studio
                          </div>
                          <div className="p-2 rounded bg-[#1C1C1B] border border-[#3E3E38] text-[11px] text-[#FAF9F5] flex items-center gap-1.5">
                            <span className="text-[#D97757]">◈</span> Lucide Icons
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-[#83827D] font-mono text-center">
                        ✓ When working on this codebase, everything you rely on is assembled in one view.
                      </div>
                    </div>
                  )}

                  {/* STEP 5: FIND WHAT YOU NEED (INTERACTIVE SEARCH & FILTERS) */}
                  {currentStep === 5 && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-[#FAF9F5]">Live Search & Filter Sandbox</div>
                        <div className="relative">
                          <Flaticon
                            name="search"
                            className="text-xs text-[#83827D] absolute left-3 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="text"
                            value={demoSearchQuery}
                            onChange={(e) => setDemoSearchQuery(e.target.value)}
                            placeholder="Type to filter (e.g. react, supabase, tool)..."
                            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[#262624] border border-[#3E3E38] text-xs text-[#FAF9F5] focus:outline-none focus:border-[#D97757]"
                          />
                        </div>

                        {/* Filter pills */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {['all', 'component', 'tool', 'repo', 'snippet', 'favorites'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setDemoActiveTypeFilter(t)}
                              className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer',
                                demoActiveTypeFilter === t
                                  ? 'bg-[#D97757] text-[#FAF9F5]'
                                  : 'bg-[#262624] text-[#83827D] hover:text-[#FAF9F5] border border-[#3E3E38]'
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filter Results */}
                      <div className="space-y-1.5 max-h-[190px] overflow-y-auto">
                        {filteredDemoResources.length > 0 ? (
                          filteredDemoResources.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-semibold text-[#FAF9F5]">{item.title}</span>
                                <span className="text-[10px] text-[#83827D] ml-2 font-mono">
                                  [{item.category}]
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-[#D97757]">
                                {item.tags.map((tg) => (
                                  <span key={tg}>#{tg}</span>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-[#83827D]">
                            No resources match &ldquo;{demoSearchQuery}&rdquo;
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-[#83827D] font-mono text-center pt-1">
                        Showing {filteredDemoResources.length} of {demoResources.length} matching resources.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 3: COMPLETION SCREEN
           ===================================================================== */}
        {stage === 'complete' && (
          <div className="p-6 sm:p-10 lg:p-12 overflow-y-auto text-center flex flex-col items-center justify-center my-auto animate-fade-in">
            {/* Checkmark Mark */}
            <div className="w-12 h-12 rounded-full bg-[#D97757]/15 border border-[#D97757]/30 flex items-center justify-center text-[#D97757] text-lg mb-6 shadow-sm">
              <Flaticon name="check" className="text-sm" />
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#FAF9F5] leading-tight">
              That&apos;s Shelfspace.
            </h2>

            <p className="mt-3.5 text-sm sm:text-base text-[#B7B5A9] max-w-md leading-relaxed">
              Everything you find useful for building, kept together and easy to find.
            </p>

            {/* Final Action CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-7 h-10 text-xs sm:text-sm font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-black/10 text-[#141413] text-[10px] font-mono">
                  ↗
                </span>
              </Link>

              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#262624] px-6 h-10 text-xs sm:text-sm font-medium text-[#FAF9F5] hover:text-white border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.3)] transition-all duration-150 active:scale-[0.98] cursor-pointer"
              >
                Back to Website
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTourModal;
