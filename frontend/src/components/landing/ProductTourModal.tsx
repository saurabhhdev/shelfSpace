import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flaticon } from '../ui/Flaticon';
import { useAuth } from '../../context/AuthContext';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StepContent {
  step: number;
  indicator: string;
  title: string;
  description: string;
}

const TOUR_STEPS: StepContent[] = [
  {
    step: 1,
    indicator: '01 / 05',
    title: 'Keep Your Resources Together',
    description:
      "Save the developer tools, repositories, components and references you come across. Everything stays together, so you don't have to search through different websites to find it again.",
  },
  {
    step: 2,
    indicator: '02 / 05',
    title: 'Add Resources Easily',
    description:
      "Add a resource yourself or paste its URL to fetch its available details automatically. Review everything and save it when you're ready.",
  },
  {
    step: 3,
    indicator: '03 / 05',
    title: 'Keep Things Organized',
    description:
      'Use categories, tags and favorites to arrange your resources and keep the important ones easy to find.',
  },
  {
    step: 4,
    indicator: '04 / 05',
    title: 'Organize by Projects',
    description:
      'Create a project and add the resources you need for it. You can also use the same resource in multiple projects.',
  },
  {
    step: 5,
    indicator: '05 / 05',
    title: 'Find Resources Quickly',
    description:
      "Search your collection or use filters to find the tool, repository or reference you're looking for.",
  },
];

export const ProductTourModal: React.FC<ProductTourModalProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Lock background scroll and handle Escape key
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

  // Reset to Step 1 on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setIsFinished(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStepData = TOUR_STEPS[currentStep - 1];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsFinished(true);
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
      aria-label="Shelfspace Product Tour"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-xs"
    >
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#1C1C1B] border border-[#3E3E38] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Subtle Header */}
        <div className="px-5 py-3 border-b border-[#3E3E38] bg-[#262624]/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded bg-[#141413] border border-[#3E3E38] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]"></span>
            </div>
            <span className="text-xs font-semibold text-[#FAF9F5] tracking-wide">
              Product Tour
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isFinished && (
              <span className="font-mono text-xs text-[#83827D]">
                {currentStepData.indicator}
              </span>
            )}
            <button
              onClick={onClose}
              aria-label="Close tutorial"
              className="p-1 rounded text-[#83827D] hover:text-[#FAF9F5] hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              <Flaticon name="cross" className="text-xs" />
            </button>
          </div>
        </div>

        {/* =====================================================================
            MAIN CONTENT AREA
           ===================================================================== */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
            {/* -----------------------------------------------------------------
                1. EXPLANATION AREA (Left on Desktop, Top on Mobile)
               ----------------------------------------------------------------- */}
            <div className="w-full md:w-[320px] lg:w-[340px] p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#3E3E38] shrink-0 bg-[#262624]/30">
              <div>
                {/* Step indicator */}
                <div className="font-mono text-xs font-semibold text-[#D97757] tracking-wider mb-2">
                  {currentStepData.indicator}
                </div>

                {/* Heading */}
                <h3 className="text-xl sm:text-2xl font-bold text-[#FAF9F5] tracking-tight leading-snug">
                  {currentStepData.title}
                </h3>

                {/* Short, natural explanation (1-2 sentences) */}
                <p className="mt-3 text-sm text-[#B7B5A9] leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 pt-5 border-t border-[#3E3E38]/80 flex items-center justify-between gap-3">
                <button
                  onClick={onClose}
                  className="text-xs text-[#83827D] hover:text-[#FAF9F5] transition-colors cursor-pointer"
                >
                  Skip tour
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrev}
                      className="px-3 h-8 rounded-md bg-[#1C1C1B] hover:bg-[#262624] text-xs font-medium text-[#FAF9F5] border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all cursor-pointer active:scale-[0.98]"
                    >
                      Previous
                    </button>
                  )}

                  <button
                    onClick={handleNext}
                    className="px-4 h-8 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] text-xs font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_2px_0_rgba(0,0,0,0.35)] transition-all cursor-pointer active:scale-[0.98]"
                  >
                    {currentStep === 5 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------------------------
                2. MAIN PREVIEW AREA (Read-Only Interface Preview)
               ----------------------------------------------------------------- */}
            <div className="flex-1 p-5 sm:p-7 bg-[#141413] flex flex-col justify-center">
              <div className="w-full bg-[#1C1C1B] rounded-lg border border-[#3E3E38] overflow-hidden shadow-sm">
                {/* Browser bar */}
                <div className="px-3.5 py-2 bg-[#262624] border-b border-[#3E3E38] flex items-center justify-between text-[11px] font-mono text-[#83827D]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#3E3E38] inline-block"></span>
                    <span className="w-2 h-2 rounded-full bg-[#3E3E38] inline-block"></span>
                    <span className="w-2 h-2 rounded-full bg-[#3E3E38] inline-block"></span>
                  </div>
                  <div className="text-[11px] text-[#B7B5A9]">
                    {currentStep === 1 && 'shelfspace.app/library'}
                    {currentStep === 2 && 'shelfspace.app/resources/add'}
                    {currentStep === 3 && 'shelfspace.app/collections'}
                    {currentStep === 4 && 'shelfspace.app/projects'}
                    {currentStep === 5 && 'shelfspace.app/search'}
                  </div>
                  <span className="text-[10px] text-[#83827D] uppercase tracking-wider">Preview</span>
                </div>

                {/* Step Previews */}
                <div className="p-4 sm:p-5 min-h-[300px] flex flex-col justify-center">
                  {/* STEP 1 PREVIEW: ALL RESOURCES LIST */}
                  {currentStep === 1 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#FAF9F5] pb-2 border-b border-[#3E3E38]">
                        <span className="font-semibold">Library (4 items)</span>
                        <div className="flex gap-1.5 font-mono text-[10px] text-[#83827D]">
                          <span className="px-1.5 py-0.5 rounded bg-[#262624] text-[#FAF9F5] border border-[#3E3E38]">List</span>
                          <span className="px-1.5 py-0.5 rounded text-[#83827D]">Grid</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="p-2.5 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]"></span>
                            <div>
                              <div className="font-medium text-[#FAF9F5]">Radix UI Primitives</div>
                              <div className="text-[11px] text-[#83827D]">Unstyled, accessible React UI components.</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-[#D97757]">UI Components</span>
                            <span className="text-amber-400">★</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <div>
                              <div className="font-medium text-[#FAF9F5]">Lucide Icons</div>
                              <div className="text-[11px] text-[#83827D]">Clean, customizable community icon set.</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-cyan-400">Tools</span>
                            <span className="text-amber-400">★</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                            <div>
                              <div className="font-medium text-[#FAF9F5]">Tailwind CSS v4</div>
                              <div className="text-[11px] text-[#83827D]">Utility-first styling engine for modern apps.</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="text-purple-400">Framework</span>
                            <span className="text-[#83827D]">☆</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 PREVIEW: ADD RESOURCE MODAL */}
                  {currentStep === 2 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#3E3E38] text-xs">
                        <span className="font-semibold text-[#FAF9F5]">Add Resource</span>
                        <div className="flex gap-1 font-mono text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-[#262624] text-[#FAF9F5] border border-[#3E3E38]">Auto Add</span>
                          <span className="px-2 py-0.5 rounded text-[#83827D]">Manual Add</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] text-[#83827D] block">Resource URL</label>
                        <div className="p-2 rounded bg-[#262624] border border-[#3E3E38] text-xs font-mono text-[#FAF9F5] truncate">
                          https://github.com/facebook/react
                        </div>
                      </div>

                      <div className="p-3 rounded bg-[#262624]/60 border border-[#3E3E38] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#D97757]">
                          <span>Metadata Fetched</span>
                          <span className="text-emerald-400">GitHub Repository</span>
                        </div>
                        <div className="font-semibold text-[#FAF9F5]">facebook/react</div>
                        <div className="text-[11px] text-[#B7B5A9]">
                          The library for web and native user interfaces.
                        </div>
                        <div className="flex gap-1.5 pt-1 text-[10px] font-mono text-[#83827D]">
                          <span>#javascript</span>
                          <span>#ui</span>
                          <span>#frontend</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 PREVIEW: CATEGORIES & TAGS */}
                  {currentStep === 3 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#3E3E38] text-xs">
                        <span className="font-semibold text-[#FAF9F5]">Categories & Favorites</span>
                        <span className="font-mono text-[10px] text-[#D97757]">3 Categories</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded bg-[#262624]/60 border border-[#3E3E38] space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-[#FAF9F5]">
                            <span className="w-2 h-2 rounded-full bg-[#D97757]"></span>
                            <span>UI Systems</span>
                          </div>
                          <div className="text-[11px] text-[#83827D]">18 resources</div>
                        </div>

                        <div className="p-3 rounded bg-[#262624]/60 border border-[#3E3E38] space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-[#FAF9F5]">
                            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                            <span>Developer Tools</span>
                          </div>
                          <div className="text-[11px] text-[#83827D]">24 resources</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">★</span>
                          <span className="text-[#FAF9F5] font-medium">Starred Favorites</span>
                        </div>
                        <span className="font-mono text-[11px] text-[#83827D]">Pinned view</span>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 PREVIEW: PROJECTS WORKSPACE */}
                  {currentStep === 4 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#3E3E38] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#FAF9F5]">Project: SaaS Platform</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                            Active
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#83827D]">4 resources attached</span>
                      </div>

                      <p className="text-[11px] text-[#83827D]">
                        Resources are linked directly to this workspace without copying or duplicating:
                      </p>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between">
                          <span className="text-[#FAF9F5] font-medium">Radix UI Primitives</span>
                          <span className="text-[10px] font-mono text-[#83827D]">Used in 2 projects</span>
                        </div>
                        <div className="p-2 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between">
                          <span className="text-[#FAF9F5] font-medium">Supabase Auth SDK</span>
                          <span className="text-[10px] font-mono text-[#83827D]">Used in 1 project</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5 PREVIEW: SEARCH & FILTERS */}
                  {currentStep === 5 && (
                    <div className="space-y-3">
                      <div className="p-2 rounded bg-[#262624] border border-[#3E3E38] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-[#FAF9F5]">
                          <span className="text-[#83827D]">🔍</span>
                          <span>react components</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#D97757]">3 matches</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#83827D]">
                        <span className="px-2 py-0.5 rounded bg-[#D97757] text-[#FAF9F5]">All</span>
                        <span className="px-2 py-0.5 rounded bg-[#262624] border border-[#3E3E38]">UI Kits</span>
                        <span className="px-2 py-0.5 rounded bg-[#262624] border border-[#3E3E38]">Tools</span>
                        <span className="px-2 py-0.5 rounded bg-[#262624] border border-[#3E3E38]">Repos</span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="p-2 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between">
                          <span className="font-medium text-[#FAF9F5]">Radix UI Primitives</span>
                          <span className="font-mono text-[10px] text-[#D97757]">#react #ui</span>
                        </div>
                        <div className="p-2 rounded bg-[#262624]/60 border border-[#3E3E38] flex items-center justify-between">
                          <span className="font-medium text-[#FAF9F5]">Shadcn UI Components</span>
                          <span className="font-mono text-[10px] text-[#D97757]">#react #tailwind</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =====================================================================
              FINAL SCREEN (Simple, clean closing message)
             ===================================================================== */
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center my-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF9F5]">
              That&apos;s Shelfspace.
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#B7B5A9] max-w-md leading-relaxed">
              Keep the resources you use for building together, organized and easy to find.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#FAF9F5] hover:bg-[#EDE9DE] px-6 h-10 text-xs sm:text-sm font-medium text-[#141413] border border-white/60 hover:border-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_1px_3px_0_rgba(0,0,0,0.35)] transition-all active:scale-[0.98] cursor-pointer"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                <span className="text-[11px] font-mono">↗</span>
              </Link>

              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-[#1C1C1B] hover:bg-[#262624] px-5 h-10 text-xs sm:text-sm font-medium text-[#FAF9F5] hover:text-white border border-[#3E3E38] hover:border-[#52514A] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_1px_2px_0_rgba(0,0,0,0.3)] transition-all active:scale-[0.98] cursor-pointer"
              >
                Close Tour
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTourModal;
